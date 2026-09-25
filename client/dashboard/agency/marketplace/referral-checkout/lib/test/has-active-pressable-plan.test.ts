import { hasActivePressablePlanForClient } from '../has-active-pressable-plan';
import type { Referral, ReferralPurchase } from '@automattic/api-core';

const purchase = ( overrides: Partial< ReferralPurchase > ): ReferralPurchase =>
	( {
		status: 'active',
		product_id: 1,
		quantity: 1,
		license: {
			license_key: 'pressable-wp-1_abc',
			issued_at: '2026-01-01',
			attached_at: null,
			revoked_at: null,
		},
		site_assigned: '',
		referral_id: 1,
		...overrides,
	} ) as ReferralPurchase;

const referral = ( email: string, purchases: ReferralPurchase[] ): Referral =>
	( {
		id: 1,
		client: { id: 1, email },
		purchases,
		purchaseStatuses: [],
		referralStatuses: [],
		referrals: [],
	} ) as Referral;

describe( 'hasActivePressablePlanForClient', () => {
	it( 'finds an active Pressable plan on the client, ignoring case and spaces in the email', () => {
		const referrals = [ referral( 'Client@Example.com', [ purchase( {} ) ] ) ];
		expect( hasActivePressablePlanForClient( referrals, ' client@example.com ' ) ).toBe( true );
	} );

	it( 'ignores revoked, inactive and add-on licenses, and other clients', () => {
		const referrals = [
			referral( 'a@example.com', [
				purchase( { status: 'pending' } ),
				purchase( {
					license: {
						license_key: 'pressable-wp-1_abc',
						issued_at: '',
						attached_at: null,
						revoked_at: '2026-02-01',
					},
				} ),
				purchase( {
					license: {
						license_key: 'pressable-addon-storage_abc',
						issued_at: '',
						attached_at: null,
						revoked_at: null,
					},
				} ),
			] ),
		];
		expect( hasActivePressablePlanForClient( referrals, 'a@example.com' ) ).toBe( false );
		expect( hasActivePressablePlanForClient( referrals, 'b@example.com' ) ).toBe( false );
		expect( hasActivePressablePlanForClient( undefined, 'a@example.com' ) ).toBe( false );
		expect( hasActivePressablePlanForClient( referrals, '' ) ).toBe( false );
	} );
} );
