#!/usr/bin/env node

var program = require('commander')
var humanize = require('humanize')
var Table = require('easy-table')
var config = new (require('../lib/config'))()
var ssh = require('../lib/ssh').ssh
var split_with_escape = require('../lib/util').split_with_escape

program
	.usage('<uuid>')
	.option('-h, --host <host>', 'filter by host')
	.option('-t, --tag <tag>', 'filter by tag or datacenter')
	.option('-c, --cached', 'show cached results')
	.parse(process.argv)


function list(options) {
	var hosts = []
	if(options.host) {
		if(!(options.host in config.db.hosts)) {
			console.log('Unknown Host')
			return
		}
		hosts = [options.host]
	} else if(options.tag) {
		hosts = config.getHostsByTag(options.tag)
	} else {
		hosts = Object.keys(config.db.hosts)
	}
	
	if(options.cached) {
		printVMTable(hosts)
		return
	}
	
	updateCache(hosts, function(err) {
		if(err) {
			if(err.length == hosts.length) {
				console.log('List update failed')
				return
			}
			console.log('The following hosts failed: ' + err.join(','))
			return
		}
		printVMTable(hosts)
	})
}

function updateCache(hosts, cb) {
	var done = 0
	var failedHosts = []
	hosts.forEach(function(host) {
		ssh(host, ['vmadm', 'list', '-p', '-o', 'image_uuid,uuid,type,state,ram,quota,hostname,alias'], function(err, stdout, stderr) {
			if(err) {
				failedHosts.push(host)
				return
			}
			var vmlist = []
			stdout.trim().split("\n").forEach(function(line) {
				var line = split_with_escape(line)
				if(line.length != 8) return
				vmlist.push({
					'host': host,
					'image_uuid': line[0],
					'uuid':       line[1],
					'type':       line[2],
					'state':      line[3],
					'ram':        line[4],
					'quota':      line[5],
					'hostname':   line[6],
					'alias':      line[7]
				})
			})
			config.db.vms[host] = vmlist
			
			done++;
			if(done == hosts.length) {
				config.save()
				config.load()
				if(failedHosts.length > 0) {
					cb(failedHosts)
				}
				cb(null)

			}
		})
	})	
}

function printVMTable(hosts) {
	var t = new Table()
	hosts.forEach(function(host) {
		config.db.vms[host].forEach(function(vm) {
			t.cell('host',     vm.host, Table.padLeft)
			t.cell('uuid',     vm.uuid)
			t.cell('type',     vm.type)
			t.cell('ram',      Number(vm.ram), Table.padLeft)
			t.cell('quota',    Number(vm.quota), Table.padLeft)
			t.cell('state',    vm.state)
			t.cell('hostname', vm.hostname, Table.padLeft)
			t.cell('alias',    vm.alias)
			t.newRow()
		})
	})
	t.sort(['host', 'ram|des', 'quota|des', 'uuid'])
	console.log(t.toString())
}

list(program)