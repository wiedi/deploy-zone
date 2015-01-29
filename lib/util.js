"use strict"

var fs     = require('fs')
var crypto = require('crypto')

function split_with_escape(string, char) {
	var a = []
	char = char || ':'
	string.split(char).forEach(function(e) {
		var prev = a[a.length - 1]
		if(prev && prev.substr(-1) == "\\") {
			a[a.length - 1] = prev.slice(0, -1) + ':' + e
		} else {
			a.push(e)
		}
	})
	return a
}

function parse_manifest(file, cb) {
	fs.readFile(file, {encoding: 'utf-8'}, function(err, data) {
		if(err) {
			cb(err)
			return
		}
		var manifest = {}
		var lines = data.trim().split('\n')
		lines.forEach(function(line) {
			try {
				var split = /([^=]+)=(.*)/.exec(line).slice(1)
			} catch(e) {
				return
			}
			var key   = split.shift()
			var value = split.shift()
			
			if(value[0] == '"' && value[value.length - 1] == '"') {
				value = value.slice(1, -1)
			}
			manifest[key] = value
		})
		cb(null, manifest)
	})
}

function heredoc_helper(function_name, content) {
	var eom = crypto.randomBytes(16).toString('hex')
	return function_name + "() { cat <<'__EOM" + eom + "__'\n" + content + "\n__EOM" + eom + "__\n}\n"
}

function heredoc_tmpfile(variable_name, content) {
	var eom = crypto.randomBytes(16).toString('hex')
	return "export " + variable_name + "=$(mktemp -t dz.XXXXXX); cat<<'__EOM" + eom + "__' > $" + variable_name + "\n" + content + "\n__EOM" + eom + "__\n"
}

exports.split_with_escape = split_with_escape
exports.parse_manifest = parse_manifest
exports.heredoc_helper = heredoc_helper
exports.heredoc_tmpfile = heredoc_tmpfile