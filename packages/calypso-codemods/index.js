#!/usr/bin/env node

/**
 * External dependencies
 */
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const glob = require('glob');

/**
 * Internal dependencies
 */
const config = require('./config');
const api = require('./api');

function main() {
	const args = process.argv.slice(2);
	if (args.length === 0 || args.length === 1) {
		process.stdout.write(
			[
				'',
				'./bin/codemods/run.js codemodName[,additionalCodemods…] target1 [additionalTargets…]',
				'',
				'Valid transformation names:',
				api.getValidCodemodNames().join('\n'),
				'',
				'Example: "./bin/codemods/run.js commonjs-imports client/blocks client/devdocs"',
				'',
			].join('\n')
		);

		process.exit(0);
	}

	const [names, ...targets] = args;
	names.split(',').forEach(codemodName => api.runCodemod(codemodName, targets));
}

main();
