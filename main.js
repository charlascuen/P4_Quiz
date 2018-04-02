const readline = require('readline'),
Quiz = require('./quiz.js'),
chalk = require('chalk'),
net = require('net'),
Store = require('./store.js')('sql');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
rl.on('close', () => {
	console.log('Adiós!');
	process.exit(0);
});




let commands;

const prompText = chalk.magenta("quiz > ");
let quiz;
let store = new Store();
store.init().then(() => {
	let server = net.createServer((socket) => {
		let quiz = new Quiz(store, rl, socket);
		commands = quiz.commands;
		socket.write(prompText);
		socket.on('data', (data) => {
			if (!quiz.lock) {
				console.log(data);
				processInput(data.toString().replace(/[\n\r]+/g, ''), quiz, socket)
			}
		});
	});
	
	server.listen(3030);
}).catch((error) => {
	console.log(error);
});

function processInput(command, quiz, socket) {
	let splitCommand = command.split(" ");
	let commandName = splitCommand[0].toLowerCase();
	let commandArgs;
	if (splitCommand.length > 1) {
		commandArgs = splitCommand.slice(1, splitCommand.length);
	}
	
	let promise;
	for (command of commands) {
		if(command.name == commandName || command.alias == commandName){
			if (commandArgs) {
				promise = quiz[command.name](...commandArgs);
			} else {
				promise = quiz[command.name]();
			}
			
			commandFound = true;
			break;
		}
	}
	
	if(promise) {
		promise.then(() => {
			socket.write(prompText);
			socket._events.data = (data) => {
				if (!quiz.lock) {
					console.log(data);
					processInput(data.toString().replace(/[\n\r]+/g, ''), quiz, socket)
				}
			}
		}).catch((error) => {
			console.log(error);
		});
	} else {
		socket.write(chalk.yellow.bgRed.bold("El comando " + commandName + " no se ha encontrado, pruebe con \"help\""));
		socket.write(prompText);
		socket._events.data = (data) => {
			if (!quiz.lock) {
				console.log(data);
				processInput(data.toString().replace(/[\n\r]+/g, ''), quiz, socket)
			}
		}
	}
	
}