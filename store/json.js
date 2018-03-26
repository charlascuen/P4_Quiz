const fs = require('fs');

let file = '../quizzes.json';
let quizzes = 
exports.getQuizzes = function () {
	new Promise(function(resolve, reject) {
		fs.readFile(file, 'utf8', (error, contents) => {
			if (error) {
				return reject(error)
			}
			resolve(JSON.parse(contents));
		});
	});
	
}

exports.add = function (quiz) {
	new Promise(function(resolve, reject) {
		fs.writeFile(file, JSON.stringify(this.quizzes), (error) => {
			if (error) {
				return reject(error);
			}
			resolve();
		});
	});
}

exports.delete = function () {
	
}

exports.edit = function () {
	
}