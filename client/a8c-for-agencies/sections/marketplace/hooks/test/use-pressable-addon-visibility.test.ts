import { getPressableAddonLicenseVisibility } from '../use-pressable-addon-visibility';
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
			hasActiveReferralPressablePlanLicense: false,
		} );
	} );

	it( 'OFF mode case: only referral pressable plan license does not grant agency visibility', () => {
		const visibility = getPressableAddonLicenseVisibility( [
			buildLicense( {
				licenseKey: 'pressable-premium',
				referral: { id: 10 } as License[ 'referral' ],
			} ),
		] );

		expect( visibility ).toEqual( {
			hasActiveAgencyPressablePlanLicense: false,
			hasActiveReferralPressablePlanLicense: true,
		} );
	} );

	it( 'ON mode case: only non-referral pressable plan license does not grant referral visibility', () => {
		const visibility = getPressableAddonLicenseVisibility( [
			buildLicense( { licenseKey: 'pressable-premium' } ),
		] );

		expect( visibility ).toEqual( {
			hasActiveAgencyPressablePlanLicense: true,
			hasActiveReferralPressablePlanLicense: false,
		} );
	} );

	it( 'marks both visibilities when both license types exist', () => {
		const visibility = getPressableAddonLicenseVisibility( [
			buildLicense( { licenseKey: 'pressable-premium' } ),
			buildLicense( {
				licenseKey: 'pressable-signature-3',
				referral: { id: 20 } as License[ 'referral' ],
			} ),
		] );

		expect( visibility ).toEqual( {
			hasActiveAgencyPressablePlanLicense: true,
			hasActiveReferralPressablePlanLicense: true,
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
			hasActiveReferralPressablePlanLicense: false,
		} );
	} );
} );
