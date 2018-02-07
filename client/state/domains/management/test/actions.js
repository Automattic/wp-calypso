/** @format */

/**
 * Internal dependencies
 */
import {
	fetchDomainContactValidation,
	receiveDomainContactValidation,
	fetchGAppsValidation,
} from '../actions';
import {
	DOMAIN_CONTACT_INFORMATION_VALIDATE_REQUEST,
	DOMAIN_CONTACT_INFORMATION_VALIDATE_RECEIVE,
	DOMAIN_CONTACT_GAPPS_VALIDATE_REQUEST,
} from 'state/action-types';

describe( 'domain management actions', () => {
	test( '#fetchDomainContactValidation', () => {
		const action = fetchDomainContactValidation( 'Lima', 'La Paz' );

		expect( action ).toEqual( {
			type: DOMAIN_CONTACT_INFORMATION_VALIDATE_REQUEST,
			contactInformation: 'Lima',
			domainNames: 'La Paz',
		} );
	} );

	test( '#receiveDomainContactValidation', () => {
		const action = receiveDomainContactValidation( 'Santiago' );

		expect( action ).toEqual( {
			type: DOMAIN_CONTACT_INFORMATION_VALIDATE_RECEIVE,
			data: 'Santiago',
		} );
	} );

	test( '#fetchGAppsValidation', () => {
		const action = fetchGAppsValidation( 'Buenos Aires' );

		expect( action ).toEqual( {
			type: DOMAIN_CONTACT_GAPPS_VALIDATE_REQUEST,
			contactInformation: 'Buenos Aires',
		} );
	} );
} );
