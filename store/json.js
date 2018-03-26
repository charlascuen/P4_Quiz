const fs = require('fs');

let file = './quizzes.json';

module.exports = class Store {
	
	constructor() {
		
	}
	
	init() {
		return new Promise((resolve, reject) => {
			fs.readFile(file, 'utf8', (err, contents) => {
				if (err) {
					return reject(err)
				}
				this.quizzes = JSON.parse(contents);
				resolve();
			});
		});
	}
	
	getAll() {
		return new Promise((resolve, reject) => {
			resolve(this.quizzes);
		});
	}
	
	get(id) {
		return new Promise((resolve, reject) => {
			id = Number(id);
			if (Number.isInteger(id) && this.quizzes[id]) {
				resolve(this.quizzes[id]);
			} else {
				reject();
			}
		});
	}
	
	add(question, answer) {
		return new Promise((resolve, reject) => {
			let quiz = {
				question: question,
				answer: answer
			}
			this.quizzes.push(quiz);
			fs.writeFile(file, JSON.stringify(this.quizzes), (err) => {
				resolve();
			});
		});
		
	}
	
	delete(id) {
		console.log(id);
		return new Promise((resolve, reject) => {
			id = Number(id);
			if (Number.isInteger(id) && this.quizzes[id]) {
				this.quizzes.splice(id, 1);
				fs.writeFile(file, JSON.stringify(this.quizzes), (err) => {
					resolve();
				});
			} else {
				reject();
			}
		});
	}
	
	update(id, question, answer) {
		return new Promise((resolve, reject) => {
			id = Number(id);
			if (Number.isInteger(id) && this.quizzes[id]) {
				let quiz = {
					question: question,
					answer: answer
				}
				this.quizzes[id] = quiz;
				fs.writeFile(file, JSON.stringify(this.quizzes), (err) => {
					resolve();
				});
			} else {
				reject();
			}
		});
	}
}