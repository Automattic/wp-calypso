/**
 * External dependencies
 */
import find from 'lodash/find';

/**
 * Internal dependencies
 */
import { whoisType } from './constants';

function createDomainWhois( dataTransferObject ) {
	const registrantWhois = createWhois( dataTransferObject, whoisType.REGISTRANT ),
		privacyServiceWhois = createWhois( dataTransferObject, whoisType.PRIVACY_SERVICE );

	return [
		registrantWhois,
		privacyServiceWhois
	];
}

function createWhois( dataTransferObject, type ) {
	const contactInformation = find( dataTransferObject, { type } ) || {};

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
		fax: contactInformation.fax || '',
		type
	};
}

export default {
	createDomainWhois
};
