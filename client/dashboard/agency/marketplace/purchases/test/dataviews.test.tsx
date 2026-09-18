/**
 * @jest-environment jsdom
 */
import { JetpackLicenseFilter, JetpackLicenseSortField } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
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
		for ( const value of [ 'constructor', 'active', [ 'revoked' ] ] ) {
			const view: View = {
				...DEFAULT_VIEW,
				filters: [ { field: 'status', operator: 'is', value } ],
			};
			expect( toFetchOptions( view ).filter ).toBe( JetpackLicenseFilter.NotRevoked );
		}
	} );

	it( 'falls back to sorting by issue date for fields the endpoint cannot sort', () => {
		const view: View = { ...DEFAULT_VIEW, sort: { field: 'product', direction: 'asc' } };
		expect( toFetchOptions( view ).sortField ).toBe( JetpackLicenseSortField.IssuedAt );
	} );
} );

describe( 'the site field', () => {
	const unassignedWpcom = {
		license_id: 1,
		license_key: 'wpcom-hosting-business_abc',
		product: 'WordPress.com Business',
		siteurl: null,
		revoked_at: null,
	} as JetpackLicense;

	function renderSiteCell( provisioningLicenseKeys: Set< string > ) {
		const fields = getLicenseFields( {
			locale: 'en',
			isAgencyOwner: true,
			provisioningLicenseKeys,
		} );
		const site = fields.find( ( field ) => field.id === 'site' );
		render( <>{ site?.render?.( { item: unassignedWpcom, field: site } ) }</> );
	}

	it( 'reports a license whose site is being created', () => {
		renderSiteCell( new Set( [ 'wpcom-hosting-business_abc' ] ) );
		expect( screen.getByText( 'Being created…' ) ).toBeVisible();
	} );

	it( 'reports an unassigned license with no site on the way', () => {
		renderSiteCell( new Set() );
		expect( screen.getByText( 'Not assigned' ) ).toBeVisible();
	} );
} );
