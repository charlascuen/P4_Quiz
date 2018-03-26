const fs = require('fs'),
chalk = require('chalk'),
log = require('./log.js');

module.exports = class Quiz {
	
	constructor(store, rl) {
		this.store = store;
		this.rl = rl;
		this.commands = [
			{
				name: "help",
				description: "Muestra la ayuda.",
				alias: "h"
			},
			{
				name: "list",
				description: "Listar los quizzes existentes."
			},
			{
				name: "show",
				description: "Muestra la pregunta y la respuesta del quiz indicado."
			},
			{
				name: "add",
				description: "Añadir un nuevo quiz interactivamente."
			},
			{
				name: "delete",
				description: "Borrar el quiz indicado."
			},
			{
				name: "edit",
				description: "Editar el quiz indicado."
			},
			{
				name: "test",
				description: "Probar el quiz indicado."
			},
			{
				name: "play",
				description: "Jugar con las preguntas aleatorias de todos los quizzes.",
				alias: "p"
			},
			{
				name: "credits",
				description: "Créditos"
			},
			{
				name: "quit",
				description: "Salir del programa.",
				alias: "q"
			},
		];
	}
	
	help() {
		return new Promise((resolve, reject) => {
			let text = "Comandos:\n";
			for (let command of this.commands) {
				text += "\t" + command.name + (command.alias ? "|" + command.alias : "") + "\t-" + command.description + "\n";
			}
			console.log(text);
			
			resolve();
		});
	}
	
	list() {
		return new Promise((resolve, reject) => {
			
			this.store.getAll().then((quizzes) => {
				if (quizzes.length > 0) {
					let text = "";
					for (let id in quizzes) {
						text += log.quizQuestion(id, quizzes[id].question);
					}
					console.log(text);
				} else {
					console.log(log.error("No hay preguntas almacenadas"));
				}
				
				resolve();
			})
		});
	}
	
	show(id) {
		return new Promise((resolve, reject) => {
			this.store.get(id).then((quiz) => {
				console.log(log.quizItem(id, quiz.question, quiz.answer));
				resolve();
			}).catch(() => {
				console.log(log.error("El valor del parámetro id no es válido"));
				resolve();
			});
		});
	}
	
	add() {
		return new Promise((resolve, reject) => {
			this.rl.question(chalk.red("Introduzca una pregunta: "), (question) => {
				this.rl.question(chalk.red("Introduzca la respuesta: "), (answer) => {
					let quiz = this.store.add(question, answer).then((quiz) => {
						resolve();
					});
				});
			});
		});
	}
	
	delete(id) {
		return new Promise((resolve, reject) => {
			this.store.delete(id).then((quiz) => {
				resolve();
			}).catch(() => {
				console.log(log.error("El valor del parámetro id no es válido"));
				resolve();
			});
		});
	}
	
	edit(id) {
		return new Promise((resolve, reject) => {
			this.rl.question(chalk.red("Introduzca una pregunta: "), (question) => {
				this.rl.question(chalk.red("Introduzca la respuesta: "), (answer) => {
					this.store.update(id, question, answer).then((quiz) => {
						resolve();
					}).catch(() => {
						console.log(log.error("El valor del parámetro id no es válido"));
						resolve();
					});
				});
			});
		});
	}
	
	test(id) {
		return new Promise((resolve, reject) => {
			this.questionTest(id).then((answer) => {
				if (answer) {
					console.log("Su respuesta es correcta");
					console.log(log.correct());
				} else {
					console.log("Su respuesta es incorrecta");
					console.log(log.incorrect());
				}
				return resolve();
			});
		});
	}
	
	play() {
		return new Promise((resolve, reject) => {
			this.store.getAll().then((_quizzes) => {
				let quizzes = Array.apply(null, {length: _quizzes.length}).map(Number.call, Number);
				let score = 0;
				let ask = () => {
					if(quizzes.length > 0){
						let id = Math.floor(Math.random()*quizzes.length);
						this.questionTest(quizzes[id]).then((result) => {
							if (result) {
								score++;
								console.log(`CORRECTO - Lleva ${score} aciertos.`);
							} else {
								console.log(`INCORRECTO.`);
								console.log(`Fin del juego. Aciertos: ${score}`);
								console.log(log.score(score));
								return resolve();
							}
							quizzes.splice(id, 1);
							ask();
						});
					} else {
						console.log("No hay nada más que preguntar.");
						console.log(`Fin del juego. Aciertos: ${score}`);
						console.log(log.score(score));
						resolve();
					}
				};
				ask();
			});
		});
	}
	
	credits() {
		return new Promise((resolve, reject) => {
			console.log("Autores de la práctica:");
			console.log(log.credits(`Daniel Galera Nebot`));
			console.log(log.credits(`Carlos Cuenca Enrique`));
			resolve();
		});
	}
	
	quit() {
		return new Promise((resolve, reject) => {
			console.log("Adiós!");
			process.exit();
			resolve();
		});
	}
	
	questionTest(id) {
		return new Promise((resolve, reject) => {
			this.store.get(id).then((quiz) => {
				this.rl.question(chalk.red(quiz.question + "? "), (answer) => {
					answer = answer.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
					let realAnswer = quiz.answer.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
					resolve(answer == realAnswer);
				});
			}).catch(() => {
				console.log(log.error("El valor del parámetro id no es válido"));
				resolve();
			});
			
		});
	}
}

function shuffle(a) {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}