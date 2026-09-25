import { getNewsletterPageUrl, getSubscribersUrl } from '../get-subscribers-url';
import type { AppState } from 'calypso/types';

const SITE_ID = 1;
const SITE_URL = 'https://example.com';
const ADMIN_URL = `${ SITE_URL }/wp-admin/`;
const NEWSLETTER_URL = `${ ADMIN_URL }admin.php?page=jetpack-newsletter`;

function makeState( {
	jetpack = false,
	isAtomic = false,
	jetpackVersion,
	adminUrl = ADMIN_URL,
}: {
	jetpack?: boolean;
	isAtomic?: boolean;
	jetpackVersion?: string;
	adminUrl?: string | null;
} = {} ) {
	return {
		sites: {
			items: {
				[ SITE_ID ]: {
					ID: SITE_ID,
					URL: SITE_URL,
					slug: 'example.com',
					jetpack,
					options: {
						admin_url: adminUrl,
						is_wpcom_atomic: isAtomic,
						jetpack_version: jetpackVersion,
					},
				},
			},
		},
	} as unknown as AppState;
}

describe( 'getSubscribersUrl()', () => {
	test( 'sends a Simple site to the wp-admin Newsletter page', () => {
		expect( getSubscribersUrl( makeState(), SITE_ID ) ).toBe( NEWSLETTER_URL );
	} );

	test( 'sends an Atomic site to wp-admin even when its Jetpack version is unknown', () => {
		expect( getSubscribersUrl( makeState( { jetpack: true, isAtomic: true } ), SITE_ID ) ).toBe(
			NEWSLETTER_URL
		);
	} );

	test( 'sends self-hosted Jetpack 16.1 and above to wp-admin', () => {
		expect(
			getSubscribersUrl( makeState( { jetpack: true, jetpackVersion: '16.1' } ), SITE_ID )
		).toBe( NEWSLETTER_URL );
	} );

	test( 'keeps self-hosted Jetpack below 16.1 on Jetpack Cloud', () => {
		expect(
			getSubscribersUrl( makeState( { jetpack: true, jetpackVersion: '16.0.1' } ), SITE_ID )
		).toBe( 'https://cloud.jetpack.com/subscribers/example.com' );
	} );

	test( 'keeps self-hosted Jetpack on Jetpack Cloud when the version is unknown', () => {
		expect( getSubscribersUrl( makeState( { jetpack: true } ), SITE_ID ) ).toBe(
			'https://cloud.jetpack.com/subscribers/example.com'
		);
	} );

	test( 'nests a subscriber and user id in the encoded route param', () => {
		expect(
			getSubscribersUrl( makeState(), SITE_ID, { subscriptionId: 944012532, userId: 266514373 } )
		).toBe( `${ NEWSLETTER_URL }&p=%2F%3Fsubscriber%3D944012532%26u%3D266514373` );
	} );

	test( 'omits the user id for email-only subscribers', () => {
		expect( getSubscribersUrl( makeState(), SITE_ID, { subscriptionId: 944012532 } ) ).toBe(
			`${ NEWSLETTER_URL }&p=%2F%3Fsubscriber%3D944012532`
		);
	} );

	test( 'appends the subscriber id to the Jetpack Cloud path below 16.1', () => {
		expect(
			getSubscribersUrl( makeState( { jetpack: true, jetpackVersion: '16.0' } ), SITE_ID, {
				subscriptionId: 944012532,
			} )
		).toBe( 'https://cloud.jetpack.com/subscribers/example.com/944012532' );
	} );

	test( 'builds wp-admin from the given site URL when the admin URL is missing', () => {
		expect(
			getSubscribersUrl( makeState( { adminUrl: null } ), SITE_ID, { fallbackSiteUrl: SITE_URL } )
		).toBe( `${ SITE_URL }/wp-admin/admin.php?page=jetpack-newsletter` );
	} );

	test( 'falls back to the Calypso route when nothing says where wp-admin is', () => {
		expect( getSubscribersUrl( makeState( { adminUrl: null } ), SITE_ID ) ).toBe(
			'https://wordpress.com/subscribers/example.com'
		);
	} );
} );

describe( 'getNewsletterPageUrl()', () => {
	test( 'encodes a route inside the Newsletter router', () => {
		expect( getNewsletterPageUrl( makeState(), SITE_ID, { route: '/?tab=settings' } ) ).toBe(
			`${ NEWSLETTER_URL }&p=%2F%3Ftab%3Dsettings`
		);
	} );

	test( 'returns null when the site wp-admin location is unknown', () => {
		expect( getNewsletterPageUrl( makeState( { adminUrl: null } ), SITE_ID ) ).toBeNull();
	} );
} );
