import {
	getLicenseDisplayStatus,
	getLicenseProductName,
	getLicenseStatus,
	getLicenseTags,
	isBundleParent,
	isPressableAddonLicense,
	isPressableLicense,
} from '../license-status';
import type { JetpackLicense } from '@automattic/api-core';

const baseLicense: JetpackLicense = {
	license_id: 1,
	license_key: 'jetpack-backup-t1_abc',
	product_id: 1,
	product: 'Jetpack VaultPress Backup',
	user_id: null,
	username: null,
	blog_id: null,
	siteurl: null,
	has_downloads: false,
	issued_at: '2026-01-01 00:00:00',
	attached_at: null,
	revoked_at: null,
	owner_type: 'jetpack_partner_key',
	quantity: null,
	parent_license_id: null,
	meta: null,
	referral: null,
};

const license = ( overrides: Partial< JetpackLicense > = {} ): JetpackLicense => ( {
	...baseLicense,
	...overrides,
} );

describe( 'getLicenseStatus', () => {
	it( 'is unassigned when the license has no site', () => {
		expect( getLicenseStatus( license() ) ).toBe( 'unassigned' );
	} );

	it( 'is assigned when the license is attached to a site', () => {
		expect( getLicenseStatus( license( { attached_at: '2026-01-02 00:00:00' } ) ) ).toBe(
			'assigned'
		);
	} );

	it( 'is revoked even when the license was previously attached', () => {
		expect(
			getLicenseStatus(
				license( { attached_at: '2026-01-02 00:00:00', revoked_at: '2026-01-03 00:00:00' } )
			)
		).toBe( 'revoked' );
	} );
} );

describe( 'getLicenseDisplayStatus', () => {
	it( 'shows Pressable add-ons as active instead of unassigned', () => {
		const addon = license( { license_key: 'pressable-addon-storage_x' } );
		expect( getLicenseDisplayStatus( addon ) ).toBe( 'active' );
		expect( getLicenseDisplayStatus( { ...addon, revoked_at: '2026-01-03 00:00:00' } ) ).toBe(
			'revoked'
		);
	} );

	it( 'matches the real status for every other license', () => {
		expect( getLicenseDisplayStatus( license() ) ).toBe( 'unassigned' );
		expect( getLicenseDisplayStatus( license( { license_key: 'pressable-wp-1_x' } ) ) ).toBe(
			'unassigned'
		);
		expect( getLicenseDisplayStatus( license( { attached_at: '2026-01-02 00:00:00' } ) ) ).toBe(
			'assigned'
		);
	} );
} );

describe( 'license key helpers', () => {
	it( 'detects bundle parents by quantity', () => {
		expect( isBundleParent( license( { quantity: 5 } ) ) ).toBe( true );
		expect( isBundleParent( license( { quantity: 1 } ) ) ).toBe( false );
		expect( isBundleParent( license() ) ).toBe( false );
	} );

	it( 'detects Pressable licenses and add-ons', () => {
		expect( isPressableLicense( license( { license_key: 'pressable-wp-1_x' } ) ) ).toBe( true );
		expect( isPressableLicense( license( { license_key: 'jetpack-pressable_x' } ) ) ).toBe( true );
		expect( isPressableLicense( license( { license_key: 'pressable-addon-storage_x' } ) ) ).toBe(
			true
		);
		expect( isPressableLicense( license() ) ).toBe( false );

		expect(
			isPressableAddonLicense( license( { license_key: 'pressable-addon-storage_x' } ) )
		).toBe( true );
		expect( isPressableAddonLicense( license( { license_key: 'pressable-wp-1_x' } ) ) ).toBe(
			false
		);
	} );
} );

describe( 'getLicenseProductName', () => {
	it( 'lists every WordPress.com plan under one name, like the classic list', () => {
		expect(
			getLicenseProductName(
				license( { license_key: 'wpcom-hosting-business_x', product: 'WordPress.com Business' } )
			)
		).toBe( 'WordPress.com Site' );
		expect(
			getLicenseProductName(
				license( { license_key: 'wpcom-hosting-commerce_x', product: 'WordPress.com Commerce' } )
			)
		).toBe( 'WordPress.com Site' );
	} );

	it( 'leaves other products alone', () => {
		expect( getLicenseProductName( license() ) ).toBe( 'Jetpack VaultPress Backup' );
	} );
} );

describe( 'getLicenseTags', () => {
	it( 'returns no tags for a plain license', () => {
		expect( getLicenseTags( license() ) ).toEqual( [] );
	} );

	it( 'tags referral and development licenses', () => {
		expect(
			getLicenseTags( license( { referral: { id: 1 }, meta: { a4a_is_dev_site: '1' } } ) )
		).toEqual( [ 'Referral', 'Development' ] );
	} );

	it( 'only shows the transferred tag for a while after the old subscription ended', () => {
		const recent = new Date();
		recent.setDate( recent.getDate() - 10 );
		const old = new Date();
		old.setDate( old.getDate() - 100 );

		expect(
			getLicenseTags(
				license( { meta: { a4a_transferred_subscription_expiration: recent.toISOString() } } )
			)
		).toEqual( [ 'Transferred' ] );
		expect(
			getLicenseTags(
				license( { meta: { a4a_transferred_subscription_expiration: old.toISOString() } } )
			)
		).toEqual( [] );
	} );
} );
