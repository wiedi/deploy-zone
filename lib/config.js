"use strict"

var fs = require('fs')
var path = require('path-extra')
var mkdirp = require('mkdirp')

function ConfigDB(options) {
	options = options || {}
	this.configDir = options.configDir || path.homedir() + '/.dz/'
	this.load()
}

ConfigDB.prototype.load = function() {
	var self = this
	
	this.db = {
		hosts: {},
		vms:   {},
		index: {
			hostsByTag: {},
			hostByVM:   {}
		}
	}
	
	try {
		this.db.hosts = require(this.configDir + 'hosts.json')
		this.db.vms   = require(this.configDir + 'vms.json')
	} catch(e) {}
	// build self.db.index.hostsByTag
	Object.keys(this.db.hosts).forEach(function(host) {
		var dc = self.db.hosts[host].sysinfo['Datacenter Name']
		if(!(dc in self.db.index.hostsByTag)) {
			self.db.index.hostsByTag[dc] = []
		}
		self.db.index.hostsByTag[dc].push(host)
		Object.keys(self.db.hosts[host].tags).forEach(function(tag) {
			if(!(tag in self.db.index.hostsByTag)) {
				self.db.index.hostsByTag[tag] = []
			}
			self.db.index.hostsByTag[tag].push(host)
		})
	})
	
	// build self.db.index.hostByVM
	Object.keys(this.db.vms).forEach(function(host) {
		self.db.vms[host].forEach(function(vm) {
			self.db.index.hostByVM[vm.uuid] = host
		})
	})
}

ConfigDB.prototype.save = function() {
	mkdirp.sync(this.configDir)
	fs.writeFileSync(this.configDir + 'hosts.json', JSON.stringify(this.db.hosts))
	fs.writeFileSync(this.configDir + 'vms.json', JSON.stringify(this.db.vms))
}

ConfigDB.prototype.getHostByUUID = function(uuid) {
	return this.db.index.hostByVM[uuid]
}

ConfigDB.prototype.getHostsByTag = function(tag) {
	return this.db.index.hostsByTag[tag] || []
}


module.exports = ConfigDB
