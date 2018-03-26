const  fs = require('fs'),
Sequelize = require('sequelize');

let file = 'quizzes.sqlite';


module.exports = class Store {
	
	constructor() {
		
	}
	
	init() {
		return new Promise((resolve, reject) => {
			
			this.sequelize = new Sequelize("sqlite:" + file, {logging: false});

			this.sequelize.define('quiz', {
				question: {
					type: Sequelize.STRING,
					unique: {msg: "Ya existe la pregunta"},
					validate: {notEmpty: {msg: "La pregunta no puede estar vacía"}}
				},
				answer: {
					type: Sequelize.STRING,
					validate: {notEmpty: {msg: "La respuesta no puede estar vacía"}}
				},
				createdAt: {
					type: Sequelize.DATE
				},
				updatedAt: {
					type: Sequelize.DATE
				}
			});

			this.sequelize.sync()
			.then(() => this.sequelize.models.quiz.count())
			.then(count => {
				if (!count) {
					
					fs.readFile('./quizzes.json', 'utf8', (err, contents) => {
						if (err) {
							return reject(err)
						}
						console.log(contents);
						this.quizzes = JSON.parse(contents);
						this.sequelize.models.quiz.bulkCreate(this.quizzes);
						resolve();
					});
					
				} else {
					this.quizzes = [];
					this.sequelize.models.quiz.findAll().each((quiz) => {
						this.quizzes.push(quiz);
						
					}).then(() => {
						resolve();
					});
				}
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
			this.sequelize.models.quiz.truncate();
			this.sequelize.models.quiz.bulkCreate(this.quizzes);
			resolve();
		});
		
	}
	
	delete(id) {
		console.log(id);
		return new Promise((resolve, reject) => {
			id = Number(id);
			if (Number.isInteger(id) && this.quizzes[id]) {
				this.quizzes.splice(id, 1);
				this.sequelize.models.quiz.truncate();
				this.sequelize.models.quiz.bulkCreate(this.quizzes);
				resolve();
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
				this.sequelize.models.quiz.truncate();
				this.sequelize.models.quiz.bulkCreate(this.quizzes);
				resolve();
			} else {
				reject();
			}
		});
	}
}