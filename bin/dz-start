#!/usr/bin/env node

var program = require('commander')
var config = new (require('../lib/config'))()
var ssh = require('../lib/ssh').ssh

program
	.usage('<uuid>')
	.option('-h, --host [host]', 'use host')
	.parse(process.argv)

if(program.args < 1) {
	console.error('uuid required')
	process.exit(1);
}

start(program)

function start(options) {
	var host = options.host
	var uuid = options.args[0]
	
	if(!(host)) {
		host = config.getHostByUUID(uuid)
	}
	if(!(host)) {
		console.log('Unknown UUID, please specify host or refresh cache')
		return
	}
	ssh(host, ['vmadm', 'start', uuid], function(err, stdout, stderr) {
		if(err) {
			console.log(stdout,stderr)
			return
		}
		console.log(stdout)
	})
}