/**
 * External dependencies
 */
import {
	endsWith,
	some
} from 'lodash';

const OPENSRS_TLDS = [ '.live' ],
	OPENHRS_TLDS = [
		'.net',
		'.wales'
	];

function domainEndsWithTld( domain, tlds ) {
	return some( tlds, ( tld ) => endsWith( domain, tld ) );
}

function getOpenHrsProtectedContactInformation( domain ) {
	return {
		firstName: 'Private',
		lastName: 'Whois',
		organization: 'Knock Knock Whois Not There LLC',
		email: `${ domain }@privatewho.is`,
		phone: '+1.8772738550',
		address1: '60, 29th Street, #343',
		address2: '',
		city: 'San Francisco',
		state: 'CA',
		postalCode: '94110-4929',
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
		fax: '+1.4806242598',
		address1: 'DomainsByProxy.com',
		address2: '14747 N Northsight Blvd Suite 111, PMB 309',
		city: 'Scottsdale',
		state: 'AZ',
		postalCode: '85260',
		countryCode: 'US'
	};
}

function getProtectedContactInformation( domain ) {
	if ( domainEndsWithTld( domain, OPENHRS_TLDS ) ) {
		return getOpenHrsProtectedContactInformation( domain );
	} else if ( domainEndsWithTld( domain, OPENSRS_TLDS ) ) {
		return getOpenSrsProtectedContactInformation( domain );
	}
	return getWwdProtectedContactInformation( domain );
}

export default getProtectedContactInformation;
