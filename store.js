const fs = require('fs');

exports = function (store) {
	return require("store/" + store + ".js")
}