const fs = require('fs');

module.exports = function (store) {
	return require("./store/" + store + ".js")
}