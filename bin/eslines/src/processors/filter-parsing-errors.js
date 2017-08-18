const filterParsingErrors = require( '../lib/filter-parsing-errors' );

module.exports = function( report ) {
	return JSON.stringify( filterParsingErrors( report ) );
};
