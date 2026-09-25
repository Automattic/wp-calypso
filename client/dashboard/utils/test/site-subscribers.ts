import { getSiteSubscribersUrl } from '../site-subscribers';
import type { Site } from '@automattic/api-core';

const ADMIN_URL = 'https://example.com/wp-admin/';
const SUBSCRIBERS_URL = `${ ADMIN_URL }admin.php?page=jetpack-newsletter&p=%2F%3Ftab%3Dsubscribers`;

function makeSite( {
	jetpackConnection = false,
	isAtomic = false,
	jetpackVersion,
	adminUrl = ADMIN_URL,
}: {
	jetpackConnection?: boolean;
	isAtomic?: boolean;
	jetpackVersion?: string;
	adminUrl?: string | null;
} = {} ) {
	return {
		slug: 'example.com',
		jetpack_connection: jetpackConnection,
		is_wpcom_atomic: isAtomic,
		options: { admin_url: adminUrl, jetpack_version: jetpackVersion },
	} as unknown as Site;
}

describe( 'getSiteSubscribersUrl()', () => {
	test( 'sends a Simple site to the Subscribers tab in wp-admin', () => {
		expect( getSiteSubscribersUrl( makeSite() ) ).toBe( SUBSCRIBERS_URL );
	} );

	test( 'sends an Atomic site to wp-admin', () => {
		expect( getSiteSubscribersUrl( makeSite( { jetpackConnection: true, isAtomic: true } ) ) ).toBe(
			SUBSCRIBERS_URL
		);
	} );

	test( 'sends self-hosted Jetpack 16.1 and above to wp-admin', () => {
		expect(
			getSiteSubscribersUrl( makeSite( { jetpackConnection: true, jetpackVersion: '16.1' } ) )
		).toBe( SUBSCRIBERS_URL );
	} );

	test( 'sends a later self-hosted Jetpack major version to wp-admin', () => {
		expect(
			getSiteSubscribersUrl( makeSite( { jetpackConnection: true, jetpackVersion: '17.0' } ) )
		).toBe( SUBSCRIBERS_URL );
	} );

	test( 'keeps self-hosted Jetpack below 16.1 on Jetpack Cloud', () => {
		expect(
			getSiteSubscribersUrl( makeSite( { jetpackConnection: true, jetpackVersion: '16.0.1' } ) )
		).toBe( 'https://cloud.jetpack.com/subscribers/example.com' );
	} );

	test( 'keeps self-hosted Jetpack on Jetpack Cloud when the version is unknown', () => {
		expect( getSiteSubscribersUrl( makeSite( { jetpackConnection: true } ) ) ).toBe(
			'https://cloud.jetpack.com/subscribers/example.com'
		);
	} );

	test( 'falls back to Jetpack Cloud when the admin URL is missing', () => {
		expect( getSiteSubscribersUrl( makeSite( { adminUrl: null } ) ) ).toBe(
			'https://cloud.jetpack.com/subscribers/example.com'
		);
	} );
} );
