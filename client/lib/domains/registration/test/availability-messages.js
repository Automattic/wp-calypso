/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { getAvailabilityNotice } from '../availability-messages';
import { domainAvailability } from 'lib/domains/constants';

jest.mock( 'i18n-calypso', () => ( {
	translate: jest.fn( () => 'default' ),
} ) );

describe( 'getAvailabilityNotice()', () => {
	test( 'Should return default message and severity', () => {
		expect( getAvailabilityNotice() ).toEqual( { message: 'default', severity: 'error' } );
	} );

	test( 'Should return default message and severity when error type not defined', () => {
		expect(
			getAvailabilityNotice( 'hello.com', null, { site: 1, maintenanceEndTime: 2 } )
		).toEqual( { message: 'default', severity: 'error' } );
	} );

	test( 'Should return default message when domain is not a string', () => {
		expect(
			getAvailabilityNotice( null, domainAvailability.BLACKLISTED, {
				site: 1,
				maintenanceEndTime: 2,
			} )
		).toEqual( { message: 'default', severity: 'error' } );
	} );

	test( 'Should return default message when domain or site not present', () => {
		expect(
			getAvailabilityNotice( null, domainAvailability.MAPPED_SAME_SITE_TRANSFERRABLE, null )
		).toEqual( { message: 'default', severity: 'error' } );
	} );

	test( 'Should return no message when tld is not present', () => {
		expect( getAvailabilityNotice( null, domainAvailability.MAINTENANCE, null ) ).toEqual( {
			message: undefined,
			severity: 'error',
		} );
		expect( getAvailabilityNotice( null, domainAvailability.NOT_REGISTRABLE, null ) ).toEqual( {
			message: undefined,
			severity: 'error',
		} );
	} );

	test( 'Should return default message when search results are empty', () => {
		expect( getAvailabilityNotice( null, domainAvailability.EMPTY_RESULTS, null ) ).toEqual( {
			message: 'default',
			severity: 'error',
		} );
	} );

	test( 'Should return no message when domain unavailable, unmappable, unknown, tld not supported, or search results are empty', () => {
		// These are special cases where the error notice should not be handled by client/components/domains/register-domain-step/index.jsx
		// but in client/components/domains/domain-search-results/index.jsx
		[
			domainAvailability.MAPPABLE,
			domainAvailability.AVAILABLE,
			domainAvailability.TLD_NOT_SUPPORTED,
			domainAvailability.UNKNOWN,
		].forEach( ( error ) => {
			expect( getAvailabilityNotice( null, error, null ) ).toEqual( {
				message: undefined,
				severity: 'error',
			} );
		} );
	} );
} );
