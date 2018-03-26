const fs = require('fs'),
chalk = require('chalk'),
log = require('./log.js');

module.exports = class Quiz {
	
	constructor(quizzes, rl) {
		this.quizzes = quizzes;
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
			
			if (this.quizzes.length > 0) {
				let text = "";
				for (let id in this.quizzes) {
					text += log.quizQuestion(id, this.quizzes[id].question);
				}
				console.log(text);
			} else {
				console.log(log.error("No hay preguntas almacenadas"));
			}
			
			resolve();
		});
	}
	
	show(id) {
		return new Promise((resolve, reject) => {
			id = Number(id);
			if (Number.isInteger(id) && this.quizzes[id]) {
				console.log(log.quizItem(id, this.quizzes[id].question, this.quizzes[id].answer));
			} else {
				console.log(log.error("El valor del parámetro id no es válido"));
			}
			
			resolve();
		});
	}
	
	add() {
		return new Promise((resolve, reject) => {
			let quiz = {};
			this.rl.question(chalk.red("Introduzca una pregunta: "), (question) => {
				quiz.question = question;
				this.rl.question(chalk.red("Introduzca la respuesta: "), (answer) => {
					quiz.answer = answer;
					this.quizzes.push(quiz);
					fs.writeFile('quizzes.json', JSON.stringify(this.quizzes), (err) => {
						resolve();
					});
				});
			});
		});
	}
	
	delete(id) {
		return new Promise((resolve, reject) => {
			
			id = Number(id);
			if (Number.isInteger(id) && this.quizzes[id]) {
				this.quizzes.splice(id, 1);
				fs.writeFile('quizzes.json', JSON.stringify(this.quizzes), (err) => {
					resolve();
				});
			} else {
				console.log(log.error("El valor del parámetro id no es válido"));
			}
			
			resolve();
		});
	}
	
	edit(id) {
		return new Promise((resolve, reject) => {
			let quiz = {};
			id = Number(id);
			if (Number.isInteger(id) && this.quizzes[id]) {
				this.rl.question(chalk.red("Introduzca una pregunta: "), (question) => {
					quiz.question = question;
					this.rl.question(chalk.red("Introduzca la respuesta: "), (answer) => {
						quiz.answer = answer;
						this.quizzes[id] = quiz;
						fs.writeFile('quizzes.json', JSON.stringify(this.quizzes), (err) => {
							resolve();
						});
					});
				});
			} else {
				console.log(log.error("El valor del parámetro id no es válido"));
			}
		});
	}
	
	test(id) {
		return new Promise((resolve, reject) => {
			id = Number(id);
			if (Number.isInteger(id) && this.quizzes[id]) {
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
				
			} else {
				console.log(log.error("El valor del parámetro id no es válido"));
			}
		});
	}
	
	play() {
		return new Promise((resolve, reject) => {
			let quizzes = Array.apply(null, {length: this.quizzes.length}).map(Number.call, Number);
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
			this.rl.question(chalk.red(this.quizzes[id].question + "? "), (answer) => {
				answer = answer.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
				let realAnswer = this.quizzes[id].answer.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
				
				resolve(answer == realAnswer);
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