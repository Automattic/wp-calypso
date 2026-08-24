import {
	canShowPressableAddonsInMarketplace,
	getPressableAddonLicenseVisibility,
} from '../use-pressable-addon-visibility';
import type { License } from 'calypso/state/partner-portal/types';

const buildLicense = ( {
	licenseKey,
	referral = null,
}: {
	licenseKey: string;
	referral?: License[ 'referral' ];
} ): License =>
	( {
		licenseId: 1,
		licenseKey,
		productId: 1,
		product: licenseKey,
		userId: null,
		username: null,
		blogId: null,
		siteUrl: null,
		hasDownloads: false,
		issuedAt: '2026-01-01T00:00:00Z',
		attachedAt: null,
		revokedAt: null,
		ownerType: null,
		quantity: 1,
		parentLicenseId: null,
		meta: {},
		referral,
	} ) as License;

describe( 'getPressableAddonLicenseVisibility', () => {
	it( 'returns no visibility for empty input', () => {
		expect( getPressableAddonLicenseVisibility( [] ) ).toEqual( {
			hasActiveAgencyPressablePlanLicense: false,
		} );
	} );

	it( 'does not grant agency visibility for a referral Pressable plan license', () => {
		const visibility = getPressableAddonLicenseVisibility( [
			buildLicense( {
				licenseKey: 'pressable-premium',
				referral: { id: 10 } as License[ 'referral' ],
			} ),
		] );

		expect( visibility ).toEqual( {
			hasActiveAgencyPressablePlanLicense: false,
		} );
	} );

	it( 'grants agency visibility for a non-referral Pressable plan license', () => {
		const visibility = getPressableAddonLicenseVisibility( [
			buildLicense( { licenseKey: 'pressable-premium' } ),
		] );

		expect( visibility ).toEqual( {
			hasActiveAgencyPressablePlanLicense: true,
		} );
	} );

	it( 'grants agency visibility when both license types exist', () => {
		const visibility = getPressableAddonLicenseVisibility( [
			buildLicense( { licenseKey: 'pressable-premium' } ),
			buildLicense( {
				licenseKey: 'pressable-signature-3',
				referral: { id: 20 } as License[ 'referral' ],
			} ),
		] );

		expect( visibility ).toEqual( {
			hasActiveAgencyPressablePlanLicense: true,
		} );
	} );

	it( 'ignores pressable add-ons and non-pressable products', () => {
		const visibility = getPressableAddonLicenseVisibility( [
			buildLicense( { licenseKey: 'pressable-addon-sites-1' } ),
			buildLicense( {
				licenseKey: 'pressable-addon-storage-1gb',
				referral: { id: 11 } as License[ 'referral' ],
			} ),
			buildLicense( { licenseKey: 'jetpack-complete' } ),
		] );

		expect( visibility ).toEqual( {
			hasActiveAgencyPressablePlanLicense: false,
		} );
	} );
} );

describe( 'canShowPressableAddonsInMarketplace', () => {
	it( 'shows add-ons in referral mode without an agency Pressable plan license', () => {
		expect(
			canShowPressableAddonsInMarketplace( {
				isReferralMode: true,
				hasActiveAgencyPressablePlanLicense: false,
			} )
		).toBe( true );
	} );

	it( 'shows add-ons in regular mode with an agency Pressable plan license', () => {
		expect(
			canShowPressableAddonsInMarketplace( {
				isReferralMode: false,
				hasActiveAgencyPressablePlanLicense: true,
			} )
		).toBe( true );
	} );

	it( 'hides add-ons in regular mode without an agency Pressable plan license', () => {
		expect(
			canShowPressableAddonsInMarketplace( {
				isReferralMode: false,
				hasActiveAgencyPressablePlanLicense: false,
			} )
		).toBe( false );
	} );
} );
