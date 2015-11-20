/**
 * External dependencies
 */
const pluck = require( 'lodash/collection/pluck' );

function createDomainObject( dataTransferObject ) {
	return pluck( dataTransferObject.accounts, 'email' );
}

module.exports = {
	createDomainObject
};
