/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { SiteDetails } from '@automattic/data-stores';
import { getShortDateString, isRunningInWpAdmin } from '../utils';

describe( 'Promote Post Utils', () => {
	const timestamp = 1687521600000; // 2023-06-23 12:00:00 GMT+0000

	beforeAll( () => {
		jest.useFakeTimers().setSystemTime( timestamp );
	} );

	test.each( [
		[ '2023-06-23T11:57:00+00:00', '3 minutes ago' ],
		[ '2023-06-23T06:00:00+00:00', '6 hours ago' ],
		[ '2023-06-22T12:00:00+00:00', 'a day ago' ],
		[ '2023-06-20T12:00:00+00:00', '3 days ago' ],
		[ '2023-05-17T12:00:00+00:00', 'May 17' ],
		[ '2021-01-10T12:00:00+00:00', 'Jan 10, 2021' ],
	] )( '[%s] returns correct short formatted date: %b', async ( date, expected ) => {
		expect( getShortDateString( date ) ).toBe( expected );
	} );

	test( "formats date that doesn't have timezones", () => {
		expect( getShortDateString( '2023-06-23 11:55' ) ).toBe( '5 minutes ago' );
	} );
} );

jest.mock( '@automattic/calypso-config' );

describe( 'isRunningInWpAdmin', () => {
	it( 'should return true if running in a Jetpack site', () => {
		( config.isEnabled as jest.Mock ).mockReturnValue( true );
		// using unknown to avoid having to mock the entire SiteDetails object
		const site = { options: { is_wpcom_simple: false } } as unknown as SiteDetails;
		expect( isRunningInWpAdmin( site ) ).toBe( true );
	} );

	it( 'should return true if running in a classic simple site', () => {
		( config.isEnabled as jest.Mock ).mockReturnValue( false );
		// using unknown to avoid having to mock the entire SiteDetails object
		const site = { options: { is_wpcom_simple: true } } as unknown as SiteDetails;
		expect( isRunningInWpAdmin( site ) ).toBe( true );
	} );

	it( 'should return false if not running in Jetpack and not a classic simple site', () => {
		( config.isEnabled as jest.Mock ).mockReturnValue( false );
		// using unknown to avoid having to mock the entire SiteDetails object
		const site = { options: { is_wpcom_simple: false } } as unknown as SiteDetails;
		expect( isRunningInWpAdmin( site ) ).toBe( false );
	} );

	it( 'should handle empty site gracefully', () => {
		// using unknown to avoid having to mock the entire SiteDetails object
		( config.isEnabled as jest.Mock ).mockReturnValue( false ) as unknown as SiteDetails;
		expect( isRunningInWpAdmin( null ) ).toBe( false );
	} );
} );
