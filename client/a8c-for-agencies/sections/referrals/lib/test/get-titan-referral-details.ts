import getTitanReferralDetails from '../get-titan-referral-details';
import type { ReferralPurchase } from '../../types';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

const titanLicense = {
	license_key: 'pressable-addon-titan-inbox_abc123',
	issued_at: '2026-10-01 00:00:00',
	attached_at: null,
	revoked_at: null,
	quantity: 5,
};

const products = [
	{ product_id: 3262, slug: 'pressable-addon-titan-inbox', name: 'Titan Inbox' },
	{ product_id: 3278, slug: 'pressable-addon-titan-inbox-premium', name: 'Titan Premium Inbox' },
	{ product_id: 2010, slug: 'jetpack-backup-t1', name: 'Jetpack Backup' },
] as APIProductFamilyProduct[];

const basePurchase = {
	status: 'active',
	product_id: 3262,
	quantity: 3,
	site_assigned: '',
	referral_id: 1,
} as ReferralPurchase;

describe( 'getTitanReferralDetails', () => {
	it( 'returns null for products that are not Titan inboxes', () => {
		expect(
			getTitanReferralDetails(
				{
					...basePurchase,
					product_id: 2010,
					license: { ...titanLicense, license_key: 'jetpack-backup-t1_xyz' },
				},
				products
			)
		).toBeNull();
	} );

	it( 'reads the domain, plan and current license quantity for an active order', () => {
		expect(
			getTitanReferralDetails(
				{
					...basePurchase,
					license: titanLicense,
					meta: { titan_domain: 'example.com', titan_plan: 'premium' },
				},
				products
			)
		).toEqual( { domain: 'example.com', plan: 'premium', inboxes: 5 } );
	} );

	it( 'detects a pending Titan referral from the catalog slug and uses the requested quantity', () => {
		expect(
			getTitanReferralDetails(
				{ ...basePurchase, meta: { titan_domain: 'example.com', titan_plan: 'standard' } },
				products
			)
		).toEqual( { domain: 'example.com', plan: 'standard', inboxes: 3 } );
	} );

	it( 'omits details the API did not supply instead of guessing them', () => {
		expect(
			getTitanReferralDetails(
				{ ...basePurchase, quantity: 0, license: { ...titanLicense, quantity: null } },
				products
			)
		).toEqual( {} );
		expect(
			getTitanReferralDetails(
				{
					...basePurchase,
					license: titanLicense,
					meta: { titan_domain: '', titan_plan: 'business' },
				},
				products
			)
		).toEqual( { inboxes: 5 } );
	} );
} );
