/**
 * External dependencies
 */
const map = require( 'lodash/map' );

function createDomainObject( dataTransferObject ) {
	return map( dataTransferObject.accounts, 'email' );
}

module.exports = {
	createDomainObject
};
