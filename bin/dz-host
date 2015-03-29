#!/usr/bin/env node

var program = require('commander')
var ssh = require('../lib/ssh').ssh
var config = new (require('../lib/config'))()
var humanize = require('humanize')
var Table = require('easy-table')

program.command('add <host>').description('add a host').action(addHost)
program.command('rm <host>').description('remove a host').action(rmHost)
program.command('tag <host> <tag>').description('add tag to host').action(function(host, tag) {
	if(!(host in config.db.hosts)) {
		console.log('Unknown host: ' + host)
		return
	}
	config.db.hosts[host].tags[tag] = true
	config.save()
})
program.command('untag <host> <tag>').description('remove tag from host').action(function(host, tag) {
	if(!(host in config.db.hosts)) {
		console.log('Unknown host: ' + host)
		return
	}
	delete config.db.hosts[host].tags[tag]
	config.save()
})
program.command('list').description('list hosts').action(listHosts)
program.parse(process.argv)

function addHost(host) {
	ssh(host, ['sysinfo'], function(err, stdout, stderr) {
		if(err) {
			console.error('Failed to add host')
			return
		}
		var sysinfo = JSON.parse(stdout)
		config.db.hosts[host] = {
			sysinfo: sysinfo,
			tags: {}
		}
		config.save()
	})
}

function rmHost(host) {
	delete config.db.hosts[host]
	config.save()
}


function listHosts(x) {
	var hosts = config.db.hosts

	if((Object.keys(hosts)).length < 1) return

	var t = new Table()
	Object.keys(hosts).forEach(function (host) {
		t.cell('datacenter', hosts[host].sysinfo['Datacenter Name'])
		t.cell('host', host)
		t.cell('ram',     humanize.filesize(Number(hosts[host].sysinfo['MiB of Memory'])*1024*1024))
		t.cell('storage', humanize.filesize(Number(hosts[host].sysinfo['Zpool Size in GiB'])*1024*1024*1024))
		t.cell('tags',    Object.keys(hosts[host].tags).join(','))
		t.newRow()
	})
	console.log(t.toString())
}

