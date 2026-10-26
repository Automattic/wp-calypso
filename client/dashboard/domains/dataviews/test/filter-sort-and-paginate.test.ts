import { DomainSubtype } from '@automattic/api-core';
import { filterSortAndPaginateDomains, getSiteDomainPinnedRank } from '../filter-sort-and-paginate';
import type { DomainSummary } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

const makeDomain = ( domain: string, overrides: Partial< DomainSummary > = {} ) =>
	( {
		domain,
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: '' },
		primary_domain: false,
		tags: [],
		...overrides,
	} ) as DomainSummary;

const fields: Field< DomainSummary >[] = [
	{
		id: 'domain',
		enableSorting: true,
		enableGlobalSearch: true,
		getValue: ( { item } ) => item.domain,
	},
];

const domains = [
	makeDomain( 'a.com' ),
	makeDomain( 'b.com' ),
	makeDomain( 'site.wordpress.com', {
		subtype: { id: DomainSubtype.DEFAULT_ADDRESS, label: '' },
	} ),
	makeDomain( 'z.com', { primary_domain: true } ),
	makeDomain( 'c.com' ),
];

const view: View = {
	type: 'table',
	sort: { field: 'domain', direction: 'asc' },
	page: 1,
	perPage: 3,
};

describe( 'filterSortAndPaginateDomains', () => {
	test( 'pins the free address and the primary site address before paginating', () => {
		const firstPage = filterSortAndPaginateDomains( domains, view, fields, {
			getPinnedRank: getSiteDomainPinnedRank,
		} );
		const secondPage = filterSortAndPaginateDomains( domains, { ...view, page: 2 }, fields, {
			getPinnedRank: getSiteDomainPinnedRank,
		} );

		expect( firstPage.data.map( ( { domain } ) => domain ) ).toEqual( [
			'site.wordpress.com',
			'z.com',
			'a.com',
		] );
		expect( secondPage.data.map( ( { domain } ) => domain ) ).toEqual( [ 'b.com', 'c.com' ] );
		expect( firstPage.paginationInfo ).toEqual( { totalItems: 5, totalPages: 2 } );
	} );

	test( 'only pins domains that match the search', () => {
		const { data } = filterSortAndPaginateDomains( domains, { ...view, search: 'z.com' }, fields, {
			getPinnedRank: getSiteDomainPinnedRank,
		} );

		expect( data.map( ( { domain } ) => domain ) ).toEqual( [ 'z.com' ] );
	} );

	test( 'keeps the view sort when no pinning is requested', () => {
		const { data } = filterSortAndPaginateDomains( domains, view, fields );

		expect( data.map( ( { domain } ) => domain ) ).toEqual( [ 'a.com', 'b.com', 'c.com' ] );
	} );
} );
