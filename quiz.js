const fs = require('fs'),
chalk = require('chalk'),
log = require('./log.js');

module.exports = class Quiz {
	
	constructor(store, rl, socket) {
		this.store = store;
		this.rl = rl;
		this.socket = socket;
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
			this.socket.write(text);
			
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
					this.socket.write(text);
				} else {
					this.socket.write(log.error("No hay preguntas almacenadas\n"));
				}
				
				resolve();
			})
		});
	}
	
	show(id) {
		return new Promise((resolve, reject) => {
			this.store.get(id).then((quiz) => {
				this.socket.write(log.quizItem(id, quiz.question, quiz.answer));
				resolve();
			}).catch(() => {
				this.socket.write(log.error("El valor del parámetro id no es válido\n"));
				resolve();
			});
		});
	}
	
	add() {
		return new Promise((resolve, reject) => {
			this.socket.write(chalk.red("Introduzca una pregunta: "));
			this.socket._events.data = (question) => {
				this.socket.write(chalk.red("Introduzca una pregunta: "));
				this.socket._events.data = (answer) => {
					this.store.add(question.toString().replace(/[\n\r]+/g, ''), answer.toString().replace(/[\n\r]+/g, '')).then(() => {
						resolve();
					});
				}
			}
		});
	}
	
	delete(id) {
		return new Promise((resolve, reject) => {
			this.store.delete(id).then((quiz) => {
				resolve();
			}).catch(() => {
				this.socket.write(log.error("El valor del parámetro id no es válido\n"));
				resolve();
			});
		});
	}
	
	edit(id) {
		return new Promise((resolve, reject) => {
			this.socket.write(chalk.red("Introduzca una pregunta: "));
			this.socket._events.data = (question) => {
				this.socket.write(chalk.red("Introduzca una pregunta: "));
				this.socket._events.data = (answer) => {
					this.store.update(id, question.toString().replace(/[\n\r]+/g, ''), answer.toString().replace(/[\n\r]+/g, '')).then(() => {
						resolve();
					}).catch(() => {
						this.socket.write(log.error("El valor del parámetro id no es válido\n"));
						resolve();
					});
				}
			}
		});
	}
	
	test(id) {
		return new Promise((resolve, reject) => {
			this.questionTest(id).then((answer) => {
				if (answer) {
					this.socket.write("Su respuesta es correcta\n");
					this.socket.write(log.correct() + '\n');
				} else {
					this.socket.write("Su respuesta es incorrecta\n");
					this.socket.write(log.incorrect() + '\n');
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
								this.socket.write(`CORRECTO - Lleva ${score} aciertos.\n`);
							} else {
								this.socket.write(`INCORRECTO.\n`);
								this.socket.write(`Fin del juego. Aciertos: ${score}\n`);
								this.socket.write(log.score(score) + '\n');
								return resolve();
							}
							quizzes.splice(id, 1);
							ask();
						});
					} else {
						this.socket.write("No hay nada más que preguntar.\n");
						this.socket.write(`Fin del juego. Aciertos: ${score}\n`);
						this.socket.write(log.score(score) + '\n');
						resolve();
					}
				};
				ask();
			});
		});
	}
	
	credits() {
		return new Promise((resolve, reject) => {
			this.socket.write("Autores de la práctica:\n");
			this.socket.write(log.credits(`Daniel Galera Nebot\n`));
			this.socket.write(log.credits(`Carlos Cuenca Enrique\n`));
			resolve();
		});
	}
	
	quit() {
		return new Promise((resolve, reject) => {
			this.socket.write("Adiós!\n");
			this.socket.destroy();
			resolve();
		});
	}
	
	questionTest(id) {
		return new Promise((resolve, reject) => {
			this.store.get(id).then((quiz) => {
				this.socket.write(chalk.red(quiz.question + "? "));
				this.socket._events.data = (answer) => {
					answer = answer.toString().replace(/[\n\r]+/g, '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
					let realAnswer = quiz.answer.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
					resolve(answer == realAnswer);
				}
			}).catch(() => {
				this.socket.write(log.error("El valor del parámetro id no es válido\n"));
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