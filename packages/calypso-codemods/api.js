#!/usr/bin/env node

/**
 * External dependencies
 */
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

/**
 * Internal dependencies
 */
const config = require(path.join(__dirname, 'config'));

function getLocalCodemodFileNames() {
	const jsFiles = fs
		.readdirSync(path.join(__dirname, './transforms'))
		.filter(filename => filename.endsWith('.js'))
		.map(name => path.basename(name, '.js')); // strip path and extension from filename

	return jsFiles;
}

function getValidCodemodNames() {
	return [...getLocalCodemodFileNames(), ...Object.getOwnPropertyNames(config.codemodArgs)]
		.map(name => '- ' + name)
		.sort();
}

function generateBinArgs(name) {
	if (config.codemodArgs.hasOwnProperty(name)) {
		// Is the codemod defined in the codemodArgs object?
		return config.codemodArgs[name];
	}

	if (getLocalCodemodFileNames().includes(name)) {
		// Is the codemod a local script defined in bin/codemods/src folder?
		return [`--transform=./transforms/${name}.js`];
	}

	throw new Error(`"${name}" is an unrecognized codemod.`);
}

function runCodemod(codemodName, transformTargets) {
	const binArgs = [...config.jscodeshiftArgs, ...generateBinArgs(codemodName), ...transformTargets];

	process.stdout.write(`\nRunning ${codemodName} on ${transformTargets.join(' ')}\n`);

	const binPath = path.join('.', 'node_modules', '.bin', 'jscodeshift');
	const jscodeshift = child_process.spawnSync(binPath, binArgs, {
		stdio: ['ignore', process.stdout, process.stderr],
	});
}

function runCodemodDry(codemodName, filepath) {
	const binArgs = [
		...config.jscodeshiftArgs,
		...generateBinArgs(codemodName),
		'--dry',
		'--print',
		'--silent',
		filepath,
	];
	const binPath = path.join('.', 'node_modules', '.bin', 'jscodeshift');

	const result = child_process.spawnSync(binPath, binArgs, {
		stdio: 'pipe',
	});

	return result.stdout.toString();
}

module.exports = {
	runCodemod,
	runCodemodDry,
	generateBinArgs,
	getValidCodemodNames,
	getLocalCodemodFileNames,
};
