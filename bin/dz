#!/usr/bin/env node

var program = require('commander')

program
	.version('0.0.1')
	.command('build [mi-repo]', 'build image from mi-repository')
	.command('images [pattern]', 'list or search available images')
	.command('list', 'list vms')
	.command('start <uuid>', 'start vm')
	.command('stop <uuid>', 'stop vm')
	.command('host', 'manage hosts')
	.command('upgrade <uuid>', 'reprovision to new image')
	.command('shell [-C] <uuid>', 'connect to console')
	.parse(process.argv)
