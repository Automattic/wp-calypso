const fs = require( 'fs' );
const enforce = require( '../lib/enforce' );

const config = JSON.parse( fs.readFileSync( '.eslines.json', 'utf-8' ) );

module.exports = function( report ) {
	const rules = config.processors.enforce.rules || [ ];
	return JSON.stringify( enforce( report, rules ) );
};
