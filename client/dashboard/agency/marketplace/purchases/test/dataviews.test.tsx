/**
 * @jest-environment jsdom
 */
import { JetpackLicenseFilter, JetpackLicenseSortField } from '@automattic/api-core';
import { DEFAULT_VIEW, getLicenseActions, toFetchOptions } from '../dataviews';
import type { JetpackLicense } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

const baseLicense: JetpackLicense = {
	license_id: 1,
	license_key: 'jetpack-backup-t1_abc',
	product_id: 1,
	product: 'Jetpack VaultPress Backup',
	user_id: null,
	username: null,
	blog_id: null,
	siteurl: null,
	has_downloads: true,
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

const unassigned = license();
const assignedJetpack = license( {
	attached_at: '2026-01-02 00:00:00',
	siteurl: 'https://example.com',
} );
const assignedWpcom = license( {
	license_key: 'wpcom-hosting-business_abc',
	product: 'WordPress.com Business',
	attached_at: '2026-01-02 00:00:00',
	siteurl: 'https://example.wpcomstaging.com',
} );
const assignedWpcomDev = license( {
	...assignedWpcom,
	meta: { a4a_is_dev_site: '1' },
} );
const referral = license( {
	...assignedWpcom,
	referral: { id: 1 },
} );
const standard = license( { owner_type: 'user' } );
const revoked = license( {
	attached_at: '2026-01-02 00:00:00',
	revoked_at: '2026-01-03 00:00:00',
	siteurl: 'https://example.com',
} );
const bundleParent = license( { quantity: 5 } );
const pressable = license( { license_key: 'pressable-wp-1_abc', product: 'Pressable' } );
const assignedPressable = license( {
	...pressable,
	attached_at: '2026-01-02 00:00:00',
	siteurl: 'https://my.pressable.com/sites/1',
} );
const pressableAddon = license( {
	license_key: 'pressable-addon-storage_abc',
	product: 'Pressable storage',
} );
const unassignedWpcom = license( { license_key: 'wpcom-hosting-business_abc' } );
const unassignedChild = license( { parent_license_id: 7 } );
const assignedChild = license( {
	parent_license_id: 7,
	attached_at: '2026-01-02 00:00:00',
	siteurl: 'https://example.com',
} );
const autoRenewOff = license( {
	...assignedWpcom,
	subscription: {
		id: 'sub_1',
		product_name: 'Hosting',
		purchase_price: 10,
		purchase_currency: 'USD',
		billing_interval_unit: 'month',
		status: 'active',
		expiry: null,
		is_auto_renew_enabled: false,
		is_refundable: false,
	},
} );
const assignedCrm = license( {
	license_key: 'jetpack-crm_abc',
	product: 'Jetpack CRM',
	attached_at: '2026-01-02 00:00:00',
	siteurl: 'https://example.com',
} );

function setup( { canRevoke = true, isAgencyOwner = true } = {} ) {
	return setupWithCallbacks( { canRevoke, isAgencyOwner } ).isEligible;
}

function setupWithCallbacks( { canRevoke = true, isAgencyOwner = true } = {} ) {
	const onOpenHosting = jest.fn();
	const actions = getLicenseActions( {
		canRevoke,
		isAgencyOwner,
		onCopyKey: () => {},
		onDownload: () => {},
		onOpenSites: () => {},
		onOpenHosting,
		recordTracksEvent: () => {},
	} );
	const run = ( id: string, item: JetpackLicense ) => {
		const action = actions.find( ( a ) => a.id === id );
		if ( ! action || ! ( 'callback' in action ) ) {
			throw new Error( `Action "${ id }" not found or has no callback` );
		}
		action.callback( [ item ], { registry: {} as never } );
	};
	const isEligible = ( id: string, item: JetpackLicense ) => {
		const action = actions.find( ( a ) => a.id === id );
		if ( ! action || ! action.isEligible ) {
			throw new Error( `Action "${ id }" not found or has no isEligible` );
		}
		return action.isEligible( item );
	};
	return { isEligible, run, onOpenHosting };
}

const SITE_ACTIONS = [
	'set-up-site',
	'change-domain',
	'hosting-configuration',
	'edit-site-in-wp-admin',
];

describe( 'getLicenseActions eligibility', () => {
	it( 'offers site actions only for sites created from a WordPress.com hosting license', () => {
		const isEligible = setup();
		for ( const id of SITE_ACTIONS ) {
			expect( isEligible( id, assignedWpcom ) ).toBe( true );
			expect( isEligible( id, assignedJetpack ) ).toBe( false );
			expect( isEligible( id, unassigned ) ).toBe( false );
		}
		expect( isEligible( 'debug-site', assignedWpcom ) ).toBe( true );
		expect( isEligible( 'debug-site', assignedJetpack ) ).toBe( true );
	} );

	it( 'never offers site actions for Pressable licenses, even to the agency owner', () => {
		const isEligible = setup( { isAgencyOwner: true } );
		for ( const id of [ ...SITE_ACTIONS, 'debug-site', 'prepare-for-launch' ] ) {
			expect( isEligible( id, assignedPressable ) ).toBe( false );
		}
	} );

	it( 'swaps launch-related actions for development sites', () => {
		const isEligible = setup();
		expect( isEligible( 'prepare-for-launch', assignedWpcomDev ) ).toBe( true );
		expect( isEligible( 'prepare-for-launch', assignedWpcom ) ).toBe( false );
		expect( isEligible( 'prepare-for-launch', assignedJetpack ) ).toBe( false );
		expect( isEligible( 'change-domain', assignedWpcomDev ) ).toBe( false );
		expect( isEligible( 'upgrade', assignedWpcomDev ) ).toBe( false );
	} );

	it( 'offers upgrade for hosting licenses that are still renewing', () => {
		const isEligible = setup();
		expect( isEligible( 'upgrade', assignedWpcom ) ).toBe( true );
		expect( isEligible( 'upgrade', unassignedWpcom ) ).toBe( true );
		expect( isEligible( 'upgrade', pressable ) ).toBe( true );
		expect( isEligible( 'upgrade', assignedJetpack ) ).toBe( false );
		expect( isEligible( 'upgrade', pressableAddon ) ).toBe( false );
		expect( isEligible( 'upgrade', assignedWpcomDev ) ).toBe( false );
		expect( isEligible( 'upgrade', referral ) ).toBe( false );
		expect( isEligible( 'upgrade', autoRenewOff ) ).toBe( false );
		expect( isEligible( 'set-up-site', referral ) ).toBe( true );
	} );

	it( 'upgrade hands the license to the hosting callback', () => {
		const { run, onOpenHosting } = setupWithCallbacks();
		run( 'upgrade', pressable );
		expect( onOpenHosting ).toHaveBeenCalledWith( pressable );
	} );

	it( 'never exposes the key of a Pressable license', () => {
		const isEligible = setup();
		expect( isEligible( 'copy-license-key', unassigned ) ).toBe( true );
		expect( isEligible( 'copy-license-key', pressable ) ).toBe( false );
	} );

	it( 'offers the CRM extensions download for assigned CRM licenses', () => {
		const isEligible = setup();
		expect( isEligible( 'download-crm-extensions', assignedCrm ) ).toBe( true );
		expect(
			isEligible( 'download-crm-extensions', license( { license_key: 'jetpack-crm_x' } ) )
		).toBe( false );
		expect( isEligible( 'download-crm-extensions', assignedJetpack ) ).toBe( false );
	} );

	it( 'offers assignment only for unassigned partner licenses', () => {
		const isEligible = setup();
		expect( isEligible( 'assign-license', unassigned ) ).toBe( true );
		expect( isEligible( 'assign-license', assignedJetpack ) ).toBe( false );
		expect( isEligible( 'assign-license', standard ) ).toBe( false );
		expect( isEligible( 'assign-license', bundleParent ) ).toBe( false );
		expect( isEligible( 'assign-license', pressableAddon ) ).toBe( false );
		expect( isEligible( 'assign-license', revoked ) ).toBe( false );
	} );

	it( 'sends unassigned WordPress.com hosting licenses to site creation instead', () => {
		const isEligible = setup();
		expect( isEligible( 'create-site', unassignedWpcom ) ).toBe( true );
		expect( isEligible( 'assign-license', unassignedWpcom ) ).toBe( false );
		expect( isEligible( 'create-site', unassigned ) ).toBe( false );
	} );

	it( 'never offers revoke for referral or standard licenses', () => {
		const isEligible = setup();
		expect( isEligible( 'revoke-license', unassigned ) ).toBe( true );
		expect( isEligible( 'revoke-license', assignedJetpack ) ).toBe( true );
		expect( isEligible( 'revoke-license', referral ) ).toBe( false );
		expect( isEligible( 'revoke-license', standard ) ).toBe( false );
		expect( isEligible( 'revoke-license', revoked ) ).toBe( false );
	} );

	it( 'hides revoke once auto-renew is off, and for unassigned child licenses', () => {
		const isEligible = setup();
		expect( isEligible( 'revoke-license', autoRenewOff ) ).toBe( false );
		expect( isEligible( 'revoke-license', assignedChild ) ).toBe( true );
		expect( isEligible( 'revoke-license', unassignedChild ) ).toBe( false );
		expect( isEligible( 'revoke-license', bundleParent ) ).toBe( true );
	} );

	it( 'respects the revoke capability', () => {
		const isEligible = setup( { canRevoke: false } );
		expect( isEligible( 'revoke-license', unassigned ) ).toBe( false );
	} );

	it( 'offers downloads only for partner licenses with downloads', () => {
		const isEligible = setup();
		expect( isEligible( 'download-license-product', unassigned ) ).toBe( true );
		expect( isEligible( 'download-license-product', standard ) ).toBe( false );
		expect( isEligible( 'download-license-product', revoked ) ).toBe( false );
		expect( isEligible( 'download-license-product', license( { has_downloads: false } ) ) ).toBe(
			false
		);
	} );

	it( 'only lets the agency owner act on Pressable licenses', () => {
		const ownerEligible = setup( { isAgencyOwner: true } );
		const memberEligible = setup( { isAgencyOwner: false } );
		for ( const id of [ 'upgrade', 'revoke-license', 'download-license-product' ] ) {
			expect( ownerEligible( id, pressable ) ).toBe( true );
			expect( memberEligible( id, pressable ) ).toBe( false );
		}
		expect( memberEligible( 'revoke-license', unassigned ) ).toBe( true );
		expect( memberEligible( 'download-license-product', unassigned ) ).toBe( true );
	} );
} );

describe( 'toFetchOptions', () => {
	it( 'maps the default view to the not-revoked filter sorted by issue date', () => {
		expect( toFetchOptions( DEFAULT_VIEW ) ).toEqual( {
			filter: JetpackLicenseFilter.NotRevoked,
			search: undefined,
			sortField: JetpackLicenseSortField.IssuedAt,
			sortDirection: 'desc',
			page: 1,
			perPage: DEFAULT_VIEW.perPage,
		} );
	} );

	it( 'maps the status filter, search, and sortable date fields', () => {
		const view: View = {
			...DEFAULT_VIEW,
			search: 'example',
			page: 3,
			filters: [ { field: 'status', operator: 'is', value: 'revoked' } ],
			sort: { field: 'revoked_at', direction: 'asc' },
		};
		expect( toFetchOptions( view ) ).toMatchObject( {
			filter: JetpackLicenseFilter.Revoked,
			search: 'example',
			sortField: JetpackLicenseSortField.RevokedAt,
			sortDirection: 'asc',
			page: 3,
		} );
	} );

	it( 'falls back to sorting by issue date for fields the endpoint cannot sort', () => {
		const view: View = { ...DEFAULT_VIEW, sort: { field: 'product', direction: 'asc' } };
		expect( toFetchOptions( view ).sortField ).toBe( JetpackLicenseSortField.IssuedAt );
	} );
} );
