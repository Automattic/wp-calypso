import {
	getActivePlanSlug,
	getJetpackCheckoutRedirectUrl,
	getSiteAdminUrl,
	isJetpackNotAtomicSite,
} from '../hooks/use-checkout-site';
import { createTestSite } from './util';
import type { Site } from '@automattic/api-core';

const withPlugins = ( plugins: string[], overrides: Partial< Site > = {} ) =>
	createTestSite( {
		...overrides,
		options: {
			admin_url: 'https://foo.com/wp-admin/',
			software_version: '6.8',
			jetpack_connection_active_plugins: plugins,
		},
	} );

describe( 'isJetpackNotAtomicSite', () => {
	it( 'is false without a site', () => {
		expect( isJetpackNotAtomicSite( undefined ) ).toBe( false );
	} );

	it( 'is false for a simple site', () => {
		expect( isJetpackNotAtomicSite( createTestSite() ) ).toBe( false );
	} );

	it( 'is true for a site with the full Jetpack plugin', () => {
		expect( isJetpackNotAtomicSite( createTestSite( { jetpack: true } ) ) ).toBe( true );
	} );

	it( 'is true for a site with only a standalone Jetpack plugin', () => {
		expect( isJetpackNotAtomicSite( withPlugins( [ 'jetpack-backup' ] ) ) ).toBe( true );
	} );

	it( 'is false for an Atomic site', () => {
		expect(
			isJetpackNotAtomicSite(
				withPlugins( [ 'jetpack' ], { jetpack: true, is_wpcom_atomic: true } )
			)
		).toBe( false );
	} );
} );

describe( 'getJetpackCheckoutRedirectUrl', () => {
	it( 'returns undefined when no known plugin is active', () => {
		expect( getJetpackCheckoutRedirectUrl( withPlugins( [ 'jetpack-search' ] ) ) ).toBeUndefined();
	} );

	it( 'prefers the full Jetpack plugin', () => {
		expect( getJetpackCheckoutRedirectUrl( withPlugins( [ 'jetpack-backup', 'jetpack' ] ) ) ).toBe(
			'admin.php?page=my-jetpack'
		);
	} );

	it( 'returns the first standalone plugin page otherwise', () => {
		expect(
			getJetpackCheckoutRedirectUrl( withPlugins( [ 'jetpack-social', 'jetpack-backup' ] ) )
		).toBe( 'admin.php?page=jetpack-social' );
	} );
} );

describe( 'getActivePlanSlug', () => {
	const plan = { product_slug: 'jetpack_security_daily', expired: false } as Site[ 'plan' ];

	it( 'returns the plan slug', () => {
		expect( getActivePlanSlug( createTestSite( { plan } ) ) ).toBe( 'jetpack_security_daily' );
	} );

	it( 'returns undefined for an expired plan', () => {
		expect(
			getActivePlanSlug( createTestSite( { plan: { ...plan!, expired: true } } ) )
		).toBeUndefined();
	} );
} );

describe( 'getSiteAdminUrl', () => {
	it( 'appends the path to the admin URL', () => {
		expect( getSiteAdminUrl( createTestSite(), '/update-core.php' ) ).toBe(
			'https://foo.com/wp-admin/update-core.php'
		);
	} );

	it( 'returns undefined without a site', () => {
		expect( getSiteAdminUrl( undefined, 'update-core.php' ) ).toBeUndefined();
	} );
} );
