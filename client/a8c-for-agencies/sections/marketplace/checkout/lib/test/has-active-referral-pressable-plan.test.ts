import hasActiveReferralPressablePlanForClient from '../has-active-referral-pressable-plan';
import type { Referral } from 'calypso/a8c-for-agencies/sections/referrals/types';

const createReferral = ( {
	email,
	purchases,
}: {
	email: string;
	purchases: Referral[ 'purchases' ];
} ): Referral =>
	( {
		id: 1,
		client: {
			id: 1,
			email,
		},
		purchases,
		purchaseStatuses: purchases.map( ( purchase ) => purchase.status ),
		referralStatuses: [ 'active' ],
		referrals: [],
	} ) as Referral;

const createPurchase = ( {
	licenseKey,
	status = 'active',
	revokedAt = null,
}: {
	licenseKey: string;
	status?: string;
	revokedAt?: string | null;
} ) =>
	( {
		referral_id: 1,
		status,
		product_id: 100,
		quantity: 1,
		license: {
			license_key: licenseKey,
			issued_at: '2026-01-01T00:00:00Z',
			attached_at: null,
			revoked_at: revokedAt,
		},
		site_assigned: '',
	} ) as Referral[ 'purchases' ][ number ];

describe( 'hasActiveReferralPressablePlanForClient', () => {
	it( 'returns true when client has an active referral Pressable plan', () => {
		const referrals = [
			createReferral( {
				email: 'client@example.com',
				purchases: [ createPurchase( { licenseKey: 'pressable-business' } ) ],
			} ),
		];

		expect( hasActiveReferralPressablePlanForClient( referrals, 'client@example.com' ) ).toBe(
			true
		);
	} );

	it( 'returns false when client only has Pressable add-ons', () => {
		const referrals = [
			createReferral( {
				email: 'client@example.com',
				purchases: [ createPurchase( { licenseKey: 'pressable-addon-sites-1' } ) ],
			} ),
		];

		expect( hasActiveReferralPressablePlanForClient( referrals, 'client@example.com' ) ).toBe(
			false
		);
	} );

	it( 'returns false when client has a non-active Pressable plan', () => {
		const referrals = [
			createReferral( {
				email: 'client@example.com',
				purchases: [ createPurchase( { licenseKey: 'pressable-business', status: 'pending' } ) ],
			} ),
		];

		expect( hasActiveReferralPressablePlanForClient( referrals, 'client@example.com' ) ).toBe(
			false
		);
	} );

	it( 'returns false when matching Pressable plan license is revoked', () => {
		const referrals = [
			createReferral( {
				email: 'client@example.com',
				purchases: [
					createPurchase( {
						licenseKey: 'pressable-premium',
						revokedAt: '2026-01-01T00:00:00Z',
					} ),
				],
			} ),
		];

		expect( hasActiveReferralPressablePlanForClient( referrals, 'client@example.com' ) ).toBe(
			false
		);
	} );

	it( 'matches emails case-insensitively', () => {
		const referrals = [
			createReferral( {
				email: 'Client@Example.com',
				purchases: [ createPurchase( { licenseKey: 'pressable-premium' } ) ],
			} ),
		];

		expect( hasActiveReferralPressablePlanForClient( referrals, 'client@example.com' ) ).toBe(
			true
		);
	} );
} );
