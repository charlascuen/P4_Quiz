const chalk = require('chalk'),
figlet = require('figlet');

exports.quizQuestion = function (id, question) {
	return "\t[" + chalk.magenta(id) + "]: " + question + "\n"
}

exports.quizItem = function (id, question, answer) {
	return "\t[" + chalk.magenta(id) + "]: " + question + "\t=>\t" + answer
}

exports.error = function (error) {
	return chalk.red("Error") + ": " + chalk.red.bgYellow.bold(error);
}

exports.big = function (text) {
	return figlet.textSync(text);
}

exports.correct = function () {
	return chalk.green(figlet.textSync("correct"));
}

exports.incorrect = function () {
	return chalk.red(figlet.textSync("incorrect"));
}

exports.score = function (score) {
	return chalk.magenta(figlet.textSync(score));
}

exports.credits = function (credits) {
	return chalk.green(credits);
}