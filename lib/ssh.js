"use strict"

var execFile = require('child_process').execFile
var async = require('async')

function ssh(host, cmd, cb) {
	execFile("ssh", [host].concat(cmd), {}, cb)
}

function pssh(hosts, cmd, cb) {
	async.mapLimit(hosts, 25, function(host, cb) {
		ssh(host, cmd, cb)
	}, cb)
}

exports.ssh  = ssh
exports.pssh = pssh