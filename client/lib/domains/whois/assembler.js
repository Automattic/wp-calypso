/**
 * External dependencies
 */
const find = require( 'lodash/collection/find' );

function createDomainObject( dataTransferObject ) {
	const contactInformation = find( dataTransferObject, 'type', 'registrant' ) || {};

	return {
		firstName: contactInformation.fname || '',
		lastName: contactInformation.lname || '',
		organization: contactInformation.org || '',
		address1: contactInformation.sa1 || '',
		address2: contactInformation.sa2 || '',
		city: contactInformation.city || '',
		state: contactInformation.state || '',
		stateName: contactInformation.sp || '',
		postalCode: contactInformation.pc || '',
		countryCode: contactInformation.country_code || '',
		countryName: contactInformation.cc || '',
		email: contactInformation.email || '',
		phone: contactInformation.phone || '',
		fax: contactInformation.fax || ''
	};
}

module.exports = {
	createDomainObject
};
