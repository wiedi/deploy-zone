#!/usr/bin/env node

var program = require('commander')
var request = require('request')
var humanize = require('humanize')
var Table = require('easy-table')
var config = new (require('../lib/config'))()


program
	.usage('[pattern]')
	.option('-c, --cached', 'show cached results')
	.parse(process.argv)


var URL = 'http://datasets.at'
var URL = 'https://images.joyent.com'

list(program)
function list(options) {
	
	request({
		uri: URL + '/images',
		json: true,
		qs: {
			limit: 20
		}
	}, function(error, response, body) {
		if(error) {
			console.log(error)
			return
		}
		console.log(body)
		printTable(body)
	})
}

function printTable(images) {
	var t = new Table()
	images.forEach(function(image) {
		t.cell('uuid',      image.uuid)
		t.cell('name',      image.owner + '/' + image.name)
		t.cell('version',   image.version)
		t.cell('published', image.published_at, function(d) {return humanize.relativeTime(new Date(d).getTime()/1000)})
		t.newRow()
	})
	//t.sort(['host', 'ram|des', 'quota|des', 'uuid'])
	console.log(t.toString())
	
}