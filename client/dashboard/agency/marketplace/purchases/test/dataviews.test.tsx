/**
 * @jest-environment jsdom
 */
import { JetpackLicenseFilter, JetpackLicenseSortField } from '@automattic/api-core';
import { render, screen } from '@testing-library/react';
import { DEFAULT_VIEW, getLicenseFields, toFetchOptions } from '../dataviews';
import type { JetpackLicense } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

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

	const renderRenewal = ( item: JetpackLicense ) => {
		const field = getLicenseFields( {
			locale: 'en',
			isAgencyOwner: true,
			provisioningLicenseKeys: new Set(),
		} ).find( ( { id } ) => id === 'renewal' );
		const Render = field!.render!;
		render( <Render item={ item } field={ field! } /> );
	};

	it( 'is shown by default', () => {
		expect( DEFAULT_VIEW.fields ).toContain( 'renewal' );
	} );

	it( 'shows the expiry date with a badge for what needs attention', () => {
		renderRenewal( license );
		expect( screen.getByText( 'Oct 21, 2026' ) ).toBeVisible();
		expect( screen.getByText( 'Auto-renew off' ) ).toBeVisible();
	} );

	it( 'shows a dash when the license has no subscription', () => {
		renderRenewal( { ...license, subscription: null } );
		expect( screen.getByText( '—' ) ).toBeVisible();
	} );
} );
