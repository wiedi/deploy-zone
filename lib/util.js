"use strict"

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

exports.split_with_escape = split_with_escape