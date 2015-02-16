#!/usr/bin/env node
"use strict"

var fs          = require('fs')
var execFile    = require('child_process').execFile
var spawn       = require('child_process').spawn
var program     = require('commander')
var uuid        = require('node-uuid')
var shellescape = require('shell-escape')
var ssh         = require('../lib/ssh').ssh
var heredoc_helper  = require('../lib/util').heredoc_helper
var heredoc_tmpfile = require('../lib/util').heredoc_tmpfile
var parse_manifest  = require('../lib/util').parse_manifest

var config = new (require('../lib/config'))()


program
	.usage('[-r <host>] [-b <uuid> | -i <uuid> [-t <file>]] [-o <path> | -p <url>] <repository>')
	.option('-r, --host <host>', 'use remote host to build')
	.option('-b, --basevm <uuid>', 'use running vm to build')
	.option('-i, --baseimg <uuid>', 'provision a new vm with this base image')
	.option('-t, --template <file>', 'use the json file for vmadm create to provision the build vm')
	.option('-o, --output <path>', 'path on host to save the manifest and image')
	.option('-p, --publish <url>', 'Publish directly to the given image source. You may not specify both "-p" and "-o".')

	.parse(process.argv)


var default_template = {
	"brand": "joyent",
	"resolvers": ["8.8.8.8"],
	"ram": 512,
	"nics": [{
		"nic_tag": "external",
		"ip": "dhcp"
	}]
}

function build(options) {
	var repo = options.args[0] || process.cwd()
	var host = options.host || process.env.DZ_BUILD_HOST
	var base_vm       = options.basevm   || process.env.DZ_BUILD_BASE_VM
	var base_img      = options.baseimg  || process.env.DZ_BUILD_BASE_IMG
	var template_file = options.template || process.env.DZ_BUILD_TEMPLATE
	var output_path   = options.output   || process.env.DZ_BUILD_OUTPUT_PATH
	var publish_url   = options.publish  || process.env.DZ_BUILD_PUBLISH_URL

	if(!(host)) {
		if(!(base_vm)) {
			console.error('host or base-vm parameter are required')
			return
		}
		host = config.getHostByUUID(base_vm)
	}
	
	if(!(host)) {
		console.log('Unknown base-vm UUID, please specify host or refresh cache')
		return
	}

	parse_manifest(repo + '/manifest', function(err, manifest) {
		if(err) {
			console.log('Error reading manifest:', err)
			return
		}

		var cmds = []
		var temporary_vm = false
		if(!(base_vm)) {
			if(!(base_img)) {
				if(!(manifest.base)) {
					console.log('No base image specified')
					return
				}
				base_img = manifest.base
			}

			var template = default_template
			if(template_file) {
				template = JSON.parse(fs.readFileSync(template_file, 'utf8'))
			}

			temporary_vm = true
			base_vm = uuid.v4()
			template['uuid']       = base_vm
			template['image_uuid'] = base_img

			cmds.push("imgadm import " + base_img)
			cmds.push("vmadm create <<'EOF'\n" + JSON.stringify(template) + "\nEOF\n")
			
		}
		execFile(__dirname + "/dz-create-mcv.sh", [repo], {}, function(err, stdout, stderr) {
			if(err) {
				console.log('Error: ' + stderr)
				return
			}
			
			cmds.push(heredoc_tmpfile("DZ_MCV", stdout))
			cmds.push(heredoc_tmpfile("DZ_MANIFEST", JSON.stringify({
				"v": "2",
				"name": manifest.name,
				"version": manifest.version
			})))
			cmds.push("trap \"rm -f ${DZ_MANIFEST} ${DZ_MCV}\" EXIT")

			var result_handler = ''
			if(output_path) {
				result_handler = '-o ' + shellescape([output_path])
			}
			if(publish_url) {
				result_handler = '-p ' + shellescape([publish_url])
			}
			cmds.push("imgadm create -c gzip -m $DZ_MANIFEST -s $DZ_MCV " + result_handler + " " + shellescape([base_vm]))

			if(temporary_vm) {
				cmds.push("vmadm delete " + base_vm)
			}
			var p = spawn("ssh", [host, "bash"], {stdio: ['pipe', process.stdout, process.stderr]})
			p.stdin.write(cmds.join("\n"))
			p.stdin.end("\n")
			
		})
	})
}

build(program)
