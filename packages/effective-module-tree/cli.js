#!/usr/bin/env node

const { effectiveTree } = require( './index.js' );

effectiveTree()
	.then( tree => {
		// eslint-disable-next-line no-console
		console.log( tree );
	} )
	.catch( err => {
		throw err;
	} );
