import { newsletterAdminUrl } from '../src/index';

const ADMIN_URL = 'https://example.com/wp-admin/';
const PAGE_URL = `${ ADMIN_URL }admin.php?page=jetpack-newsletter`;

describe( 'newsletterAdminUrl()', () => {
	test( 'names the tab inside the encoded route, where the router reads it', () => {
		expect( newsletterAdminUrl( ADMIN_URL, { tab: 'subscribers' } ) ).toBe(
			`${ PAGE_URL }&p=%2F%3Ftab%3Dsubscribers`
		);
		expect( newsletterAdminUrl( ADMIN_URL, { tab: 'settings' } ) ).toBe(
			`${ PAGE_URL }&p=%2F%3Ftab%3Dsettings`
		);
		expect( newsletterAdminUrl( ADMIN_URL, { tab: 'overview' } ) ).toBe(
			`${ PAGE_URL }&p=%2F%3Ftab%3Doverview`
		);
		expect( newsletterAdminUrl( ADMIN_URL, { tab: 'stats' } ) ).toBe(
			`${ PAGE_URL }&p=%2F%3Ftab%3Dstats`
		);
	} );

	test( 'leaves the route off for a link that means the section rather than a tab', () => {
		expect( newsletterAdminUrl( ADMIN_URL, { tab: 'default' } ) ).toBe( PAGE_URL );
	} );

	test( 'selects a subscriber alongside the list', () => {
		expect( newsletterAdminUrl( ADMIN_URL, { tab: 'subscribers', subscriber: 944012532 } ) ).toBe(
			`${ PAGE_URL }&p=%2F%3Ftab%3Dsubscribers%26subscriber%3D944012532`
		);
	} );

	test( 'carries the user id when the subscriber has one', () => {
		expect(
			newsletterAdminUrl( ADMIN_URL, {
				tab: 'subscribers',
				subscriber: 944012532,
				user: 266514373,
			} )
		).toBe( `${ PAGE_URL }&p=%2F%3Ftab%3Dsubscribers%26subscriber%3D944012532%26u%3D266514373` );
	} );

	test( 'omits the user id for an email-only subscriber', () => {
		expect(
			newsletterAdminUrl( ADMIN_URL, {
				tab: 'subscribers',
				subscriber: 944012532,
				user: undefined,
			} )
		).toBe( `${ PAGE_URL }&p=%2F%3Ftab%3Dsubscribers%26subscriber%3D944012532` );
	} );

	test( 'selects on the user id alone, which the details panel also opens on', () => {
		expect( newsletterAdminUrl( ADMIN_URL, { tab: 'subscribers', user: 266514373 } ) ).toBe(
			`${ PAGE_URL }&p=%2F%3Ftab%3Dsubscribers%26u%3D266514373`
		);
	} );

	test( 'accepts an admin URL with no trailing slash', () => {
		expect( newsletterAdminUrl( 'https://example.com/wp-admin', { tab: 'settings' } ) ).toBe(
			`${ PAGE_URL }&p=%2F%3Ftab%3Dsettings`
		);
	} );
} );
