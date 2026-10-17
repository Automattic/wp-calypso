/**
 * @jest-environment jsdom
 */
import { JetpackLicenseFilter, JetpackLicenseSortField } from '@automattic/api-core';
import { render, screen } from '@testing-library/react';
import { DEFAULT_VIEW, RenewalCell, getLicenseFields, toFetchOptions } from '../dataviews';
import type { JetpackLicense } from '@automattic/api-core';
import type { NormalizedField, View } from '@wordpress/dataviews';

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

	it( 'ignores a status filter value it does not know', () => {
		for ( const value of [ 'constructor', 'active', [ 'constructor' ], [] ] ) {
			const view: View = {
				...DEFAULT_VIEW,
				filters: [ { field: 'status', operator: 'is', value } ],
			};
			expect( toFetchOptions( view ).filter ).toBe( JetpackLicenseFilter.NotRevoked );
		}
	} );

	it( 'reads a status filter persisted while the field was multi-select', () => {
		const view: View = {
			...DEFAULT_VIEW,
			filters: [ { field: 'status', operator: 'isAny', value: [ 'unassigned' ] } ],
		};
		expect( toFetchOptions( view ).filter ).toBe( JetpackLicenseFilter.Detached );
	} );

	it( 'falls back to sorting by issue date for fields the endpoint cannot sort', () => {
		const view: View = { ...DEFAULT_VIEW, sort: { field: 'product', direction: 'asc' } };
		expect( toFetchOptions( view ).sortField ).toBe( JetpackLicenseSortField.IssuedAt );
	} );
} );

describe( 'Renewal/expiry field', () => {
	const license: JetpackLicense = {
		license_id: 1,
		license_key: 'jetpack-boost_abc',
		product_id: 1,
		product: 'Jetpack Boost',
		user_id: null,
		username: null,
		blog_id: null,
		siteurl: null,
		has_downloads: false,
		issued_at: '2026-09-21 00:00:00',
		attached_at: null,
		revoked_at: null,
		owner_type: 'jetpack_partner_key',
		quantity: null,
		parent_license_id: null,
		meta: null,
		referral: null,
		subscription: {
			id: 'sub_1',
			product_name: 'Jetpack Boost',
			purchase_price: 7.99,
			purchase_currency: 'USD',
			billing_interval_unit: 'month',
			status: 'active',
			expiry: '2026-10-21T00:00:00+00:00',
			is_auto_renew_enabled: false,
			is_refundable: false,
		},
	};

	it( 'shows the expiry date with a badge for what needs attention', () => {
		render( <RenewalCell license={ license } locale="en" /> );
		expect( screen.getByText( 'Oct 21, 2026' ) ).toBeVisible();
		expect( screen.getByText( 'Auto-renew off' ) ).toBeVisible();
	} );
} );

describe( 'Site field', () => {
	const license: JetpackLicense = {
		license_id: 7,
		license_key: 'woocommerce-subscriptions_abc',
		product_id: 1,
		product: 'WooCommerce Subscriptions',
		user_id: null,
		username: null,
		blog_id: null,
		siteurl: null,
		has_downloads: false,
		issued_at: '2026-09-21 00:00:00',
		attached_at: '2026-09-22 00:00:00',
		revoked_at: null,
		owner_type: 'jetpack_partner_key',
		quantity: null,
		parent_license_id: null,
		meta: null,
		referral: null,
	};

	function renderSite( item: JetpackLicense, isLoadingWooCommerceSites: boolean ) {
		const field = getLicenseFields( {
			locale: 'en',
			isAgencyOwner: true,
			provisioningLicenseKeys: new Set(),
			isLoadingWooCommerceSites,
			onManageSite: jest.fn(),
		} ).find( ( { id } ) => id === 'site' );
		if ( ! field?.render ) {
			throw new Error( 'The site field has no renderer' );
		}
		const SiteField = field.render;
		// The site cell reads nothing from `field`, so the normalised props DataViews adds don't matter.
		render( <SiteField item={ item } field={ field as NormalizedField< JetpackLicense > } /> );
	}

	it( 'shows no site for a Woo license while its store is looked up', () => {
		renderSite( license, true );
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Not assigned' ) ).not.toBeInTheDocument();
	} );

	it( 'links to the store once it is known', () => {
		renderSite( { ...license, siteurl: 'https://new-store.example' }, false );
		expect( screen.getByRole( 'link', { name: /new-store\.example/ } ) ).toHaveAttribute(
			'href',
			'https://new-store.example'
		);
	} );
} );
