/**
 * @jest-environment jsdom
 */
import { JetpackLicenseFilter, JetpackLicenseSortField } from '@automattic/api-core';
import { DEFAULT_VIEW, toFetchOptions } from '../dataviews';
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
