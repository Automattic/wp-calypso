'use strict';
/**
 * External Dependencies
 */

// This is a list of everything to exclude from the packaged releases
module.exports = [
	'.dockerignore',
	'.esformatter',
	'.eslintignore',
	'.jsfmtrc',
	'.rtlcssrc',
	'.npm-shrinkwrap.json',
	'calypso/.env',
	'calypso/.npmrc',
	'calypso/assets',
	'calypso/bin',
	'calypso/config/client.json',
	'calypso/config/development.json',
	'calypso/config/horizon.json',
	'calypso/config/production.json',
	'calypso/config/stage.json',
	'calypso/config/wpcalypso.json',
	'calypso/Dockerfile',
	'calypso/node_modules/.bin',
	'calypso/server/bundler/bin',
	'calypso/server/bundler/loader',
	'calypso/server/bundler/plugin',
	'calypso/Vagrantfile',
	'calypso/webpack',
	'calypso/client',
	'calypso/index.js',
	'CONTRIBUTING.md',
	'CODE-OF-CONDUCT.md',
	'docs',
	'jsconfig.json',
	'LICENSE.md',
	'Makefile',
	'node_modules/.bin',
	'npm-debug.log',
	'README.md',
	'style.scss',
	'test',
	'circle.yml'
];
