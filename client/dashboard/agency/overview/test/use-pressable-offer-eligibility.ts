import {
	getAgencyPlanLicenses,
	hasBenefitedFromIntroductoryOffer,
	hasPlanEligibleForExpansionOffer,
} from '../use-pressable-offer-eligibility';
import type { JetpackLicense } from '@automattic/api-core';

function license( overrides: Partial< JetpackLicense > ): JetpackLicense {
	return {
		license_key: 'pressable-signature-1_abc',
		issued_at: '2026-01-15 10:00:00',
		referral: null,
		...overrides,
	} as JetpackLicense;
}

describe( 'getAgencyPlanLicenses', () => {
	it( 'keeps Pressable plan licenses the agency bought for itself', () => {
		const licenses = [ license( { license_key: 'pressable-signature-1_abc' } ) ];

		expect( getAgencyPlanLicenses( licenses ) ).toEqual( licenses );
	} );

	it( 'drops addon, referral, and non-Pressable licenses', () => {
		const licenses = [
			license( { license_key: 'pressable-addon-storage_abc' } ),
			license( { referral: { id: 1 } } ),
			license( { license_key: 'jetpack-backup_abc' } ),
		];

		expect( getAgencyPlanLicenses( licenses ) ).toEqual( [] );
	} );
} );

describe( 'hasBenefitedFromIntroductoryOffer', () => {
	it( 'returns null when the agency has no plan license', () => {
		expect( hasBenefitedFromIntroductoryOffer( [] ) ).toBeNull();
	} );

	it( 'returns false when the earliest plan license predates the offer', () => {
		const licenses = [
			license( { issued_at: '2026-01-15 10:00:00' } ),
			license( { issued_at: '2026-08-20 10:00:00' } ),
		];

		expect( hasBenefitedFromIntroductoryOffer( licenses ) ).toBe( false );
	} );

	it( 'returns true when the earliest plan license was issued within the offer window', () => {
		const licenses = [ license( { issued_at: '2026-08-12 10:00:00' } ) ];

		expect( hasBenefitedFromIntroductoryOffer( licenses ) ).toBe( true );
	} );

	it( 'counts a license issued exactly on the offer start date as benefited', () => {
		const licenses = [ license( { issued_at: '2026-08-11 00:00:00' } ) ];

		expect( hasBenefitedFromIntroductoryOffer( licenses ) ).toBe( true );
	} );
} );

describe( 'hasPlanEligibleForExpansionOffer', () => {
	it( 'accepts Signature and Premium tier plans', () => {
		expect(
			hasPlanEligibleForExpansionOffer( [ license( { license_key: 'pressable-premium-2_abc' } ) ] )
		).toBe( true );
	} );

	it( 'rejects legacy plans with no upgrade path in the offer', () => {
		expect(
			hasPlanEligibleForExpansionOffer( [ license( { license_key: 'pressable-premium_abc' } ) ] )
		).toBe( false );
	} );
} );
