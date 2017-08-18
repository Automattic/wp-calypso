#!/usr/bin/env node

/* eslint strict: "off" */
'use strict';

const cli = require( './src/cli' );
const optionator = require( 'optionator' )( {
	options: [ {
		option: 'processors',
		alias: 'p',
		type: 'String',
		description: 'choose a list of processors - "downgrade-unmodified-lines" by default'
	}, {
		option: 'format',
		alias: 'f',
		type: 'String',
		description: 'choose an ESLint output format for eslines - "stylish" by default'
	}, {
		option: 'diff',
		alias: 'd',
		type: 'String',
		description: 'choose what to diff, index or remote - "remote" by default'
	}, {
		option: 'quiet',
		alias: 'q',
		type: 'Boolean',
		description: 'report errors only'
	} ]
} );

/* eslint no-process-exit: "off" */

if ( ! process.stdin.isTTY ) {
	process.stdin.setEncoding( 'utf-8' );
	let inputData = '';
	process.stdin.on( 'data', function( data ) {
		inputData = inputData + data;
	} );
	process.stdin.on( 'end', () => {
		const opts = optionator.parseArgv( process.argv );
		process.exit( cli( JSON.parse( inputData ), opts ) );
	} );
}
