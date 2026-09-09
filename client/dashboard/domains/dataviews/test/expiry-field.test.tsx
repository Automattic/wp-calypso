/**
 * @jest-environment jsdom
 */
import { DomainStatus, DomainSubtype } from '@automattic/api-core';
import { waitFor } from '@testing-library/react';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import { render } from '../../../test-utils';
import { useFields } from '../fields';
import { filterSortAndPaginateDomains } from '../filter-sort-and-paginate';
import { DEFAULT_VIEW } from '../views';
import type { DomainSummary } from '@automattic/api-core';
import type { Field, Operator, View } from '@wordpress/dataviews';

const DAY = 24 * 60 * 60 * 1000;

const inDays = ( days: number ) => new Date( Date.now() + days * DAY ).toISOString();

const domain = (
	name: string,
	expiry: string | null,
	overrides: Partial< DomainSummary > = {}
): DomainSummary =>
	( {
		domain: name,
		blog_id: 1,
		blog_name: 'Test site',
		expiry,
		expired: false,
		auto_renewing: false,
		subscription_id: 'sub-1',
		is_domain_only_site: false,
		current_user_is_owner: true,
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Registration' },
		domain_status: { id: DomainStatus.ACTIVE, label: 'Active', type: 'success' },
		...overrides,
	} ) as DomainSummary;

// All three sit in the same expiry bucket, so bucket ordering cannot separate them.
const SAME_BUCKET = [
	domain( 'middle.com', inDays( 200 ) ),
	domain( 'latest.com', inDays( 300 ) ),
	domain( 'earliest.com', inDays( 100 ) ),
];

const DOMAINS = [ ...SAME_BUCKET, domain( 'no-date.com', null ) ];

const FILTERABLE = [
	domain( 'expired.com', inDays( -30 ), { expired: true } ),
	domain( 'soon.com', inDays( 30 ) ),
	domain( 'later.com', inDays( 365 ) ),
	domain( 'no-date.com', null ),
];

type AppQueries = typeof APP_CONTEXT_DEFAULT_CONFIG.queries;

function renderFields() {
	let fields: Field< DomainSummary >[] = [];

	function Probe() {
		fields = useFields( { showPrimaryDomainBadge: false } );
		return null;
	}

	render( <Probe />, {
		config: {
			...APP_CONTEXT_DEFAULT_CONFIG,
			queries: {
				...APP_CONTEXT_DEFAULT_CONFIG.queries,
				domainsQuery: () =>
					( {
						queryKey: [ 'test', 'domains' ],
						queryFn: async () => DOMAINS,
					} ) as unknown as ReturnType< AppQueries[ 'domainsQuery' ] >,
			},
		},
	} );

	return () => fields;
}

const useReadyFields = async () => {
	const getFields = renderFields();
	await waitFor( () => expect( getFields().length ).toBeGreaterThan( 0 ) );
	return getFields();
};

const sortedNames = (
	fields: Field< DomainSummary >[],
	direction: 'asc' | 'desc',
	items: DomainSummary[] = DOMAINS,
	perPage = 100
) => {
	const view: View = { ...DEFAULT_VIEW, page: 1, perPage, sort: { field: 'expiry', direction } };
	return filterSortAndPaginateDomains( items, view, fields ).data.map( ( item ) => item.domain );
};

const filtered = (
	fields: Field< DomainSummary >[],
	value: string[],
	items: DomainSummary[] = FILTERABLE
) => {
	const view: View = {
		...DEFAULT_VIEW,
		perPage: 100,
		filters: [ { field: 'expiry', operator: 'isAny' as Operator, value } ],
	};
	return filterSortAndPaginateDomains( items, view, fields );
};

describe( 'domains "Paid until" field', () => {
	it( 'orders rows within a single expiry bucket by date', async () => {
		const fields = await useReadyFields();

		expect( sortedNames( fields, 'asc', SAME_BUCKET ) ).toEqual( [
			'earliest.com',
			'middle.com',
			'latest.com',
		] );
	} );

	it( 'keeps undated domains last in both directions', async () => {
		const fields = await useReadyFields();

		expect( sortedNames( fields, 'asc' ) ).toEqual( [
			'earliest.com',
			'middle.com',
			'latest.com',
			'no-date.com',
		] );

		expect( sortedNames( fields, 'desc' ) ).toEqual( [
			'latest.com',
			'middle.com',
			'earliest.com',
			'no-date.com',
		] );
	} );

	it( 'sorts the whole list, not just the current page', async () => {
		const fields = await useReadyFields();
		const many = Array.from( { length: 25 }, ( _, i ) =>
			domain( `d${ i }.com`, inDays( 100 + i ) )
		).reverse();

		expect( sortedNames( fields, 'asc', many, 10 ) ).toEqual(
			Array.from( { length: 10 }, ( _, i ) => `d${ i }.com` )
		);
	} );

	it( 'filters by expiry bucket', async () => {
		const fields = await useReadyFields();

		expect( filtered( fields, [ '1-expired' ] ).data.map( ( d ) => d.domain ) ).toEqual( [
			'expired.com',
		] );
		expect( filtered( fields, [ '2-next-90-days' ] ).data.map( ( d ) => d.domain ) ).toEqual( [
			'soon.com',
		] );
		expect(
			filtered( fields, [ '1-expired', '2-next-90-days' ] ).data.map( ( d ) => d.domain )
		).toEqual( [ 'expired.com', 'soon.com' ] );
	} );

	it( 'reports the filtered row count', async () => {
		const fields = await useReadyFields();

		expect( filtered( fields, [ '1-expired' ] ).paginationInfo.totalItems ).toBe( 1 );
	} );

	it( 'filters and sorts at the same time', async () => {
		const fields = await useReadyFields();
		const view: View = {
			...DEFAULT_VIEW,
			perPage: 100,
			sort: { field: 'expiry', direction: 'asc' },
			filters: [
				{
					field: 'expiry',
					operator: 'isAny' as Operator,
					value: [ '1-expired', '2-next-90-days' ],
				},
			],
		};

		expect(
			filterSortAndPaginateDomains( FILTERABLE, view, fields ).data.map( ( d ) => d.domain )
		).toEqual( [ 'expired.com', 'soon.com' ] );
	} );

	it( 'leaves other filters to DataViews', async () => {
		const fields = await useReadyFields();
		const view: View = {
			...DEFAULT_VIEW,
			perPage: 100,
			filters: [
				{ field: 'expiry', operator: 'isAny' as Operator, value: [ '1-expired' ] },
				{ field: 'domain_status', operator: 'isAny' as Operator, value: [ DomainStatus.EXPIRED ] },
			],
		};

		expect( filterSortAndPaginateDomains( FILTERABLE, view, fields ).data ).toEqual( [] );
	} );
} );
