/**
 * Internal dependencies
 */
import { registrar as registrarNames } from 'lib/domains/constants';

function getOpenHrsProtectedContactInformation( domain ) {
	return {
		firstName: 'Private',
		lastName: 'Whois',
		organization: 'Knock Knock WHOIS Not There, LLC',
		email: `${ domain }@privatewho.is`,
		phone: '+1.8772738550',
		address1: '9450 SW Gemini Dr #63259',
		address2: '',
		city: 'Beaverton',
		state: 'OR',
		postalCode: '97008-7105',
		countryCode: 'US'
	};
}

function getOpenSrsProtectedContactInformation( domain ) {
	return {
		firstName: 'Contact Privacy Inc.',
		lastName: 'Customer 012345',
		organization: 'Contact Privacy Inc. Customer 012345',
		email: `${ domain }@contactprivacy.com`,
		phone: '+1.4165385457',
		address1: '96 Mowat Ave',
		address2: '',
		city: 'Toronto',
		state: 'ON',
		postalCode: 'M6K 3M1',
		countryCode: 'CA'
	};
}

function getWwdProtectedContactInformation( domain ) {
	return {
		firstName: 'Registration',
		lastName: 'Private',
		organization: 'Domains By Proxy, LLC',
		email: `${ domain }@domainsbyproxy.com`,
		phone: '+1.4806242599',
		address1: '14747 N Northsight Blvd',
		address2: 'Suite 111, PMB 309',
		city: 'Scottsdale',
		state: 'AZ',
		postalCode: '85260',
		countryCode: 'US'
	};
}

function getProtectedContactInformation( domain, registrar ) {
	const { OPENHRS, OPENSRS, WWD } = registrarNames;
	switch ( registrar ) {
		case OPENHRS:
			return getOpenHrsProtectedContactInformation( domain );

		case OPENSRS:
			return getOpenSrsProtectedContactInformation( domain );

		case WWD:
		default:
			return getWwdProtectedContactInformation( domain );
	}
}

export default getProtectedContactInformation;
