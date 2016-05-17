/**
 * External dependencies
 */
const config = require( 'config' );
const flatten = require( 'lodash/flatten' );

const sectionGroups = [],
	sectionNames = config( 'sections' );

sectionNames.forEach( name => sectionGroups.push( require( `${name}/sections` ) ) );

module.exports = flatten( sectionGroups );
