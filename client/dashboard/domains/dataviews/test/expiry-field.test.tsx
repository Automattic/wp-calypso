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
import type { Field, Filter, Operator, View } from '@wordpress/dataviews';

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

const DOMAINS = [
	domain( 'later.com', inDays( 365 ) ),
	domain( 'no-date.com', null ),
	domain( 'expired.com', inDays( -30 ), { expired: true } ),
	domain( 'soon.com', inDays( 30 ) ),
	domain( 'sooner.com', inDays( 10 ) ),
];

type AppQueries = typeof APP_CONTEXT_DEFAULT_CONFIG.queries;

async function getFields() {
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

	await waitFor( () => expect( fields.length ).toBeGreaterThan( 0 ) );
	return fields;
}

const expiryFilter = ( value?: string[] ): Filter => ( {
	field: 'expiry',
	operator: 'isAny' as Operator,
	value,
} );

const query = ( fields: Field< DomainSummary >[], view: Partial< View > ) =>
	filterSortAndPaginateDomains(
		DOMAINS,
		{ ...DEFAULT_VIEW, perPage: 100, ...view } as View,
		fields
	);

const names = ( result: { data: DomainSummary[] } ) => result.data.map( ( d ) => d.domain );

describe( 'domains "Paid until" field', () => {
	it( 'sorts by date with undated domains last in both directions', async () => {
		const fields = await getFields();

		expect( names( query( fields, { sort: { field: 'expiry', direction: 'asc' } } ) ) ).toEqual( [
			'expired.com',
			'sooner.com',
			'soon.com',
			'later.com',
			'no-date.com',
		] );
		expect( names( query( fields, { sort: { field: 'expiry', direction: 'desc' } } ) ) ).toEqual( [
			'later.com',
			'soon.com',
			'sooner.com',
			'expired.com',
			'no-date.com',
		] );
	} );

	it( 'filters by expiry bucket and counts the matching rows', async () => {
		const fields = await getFields();
		const filterBy = ( value?: string[] ) =>
			query( fields, { filters: [ expiryFilter( value ) ] } );

		expect( names( filterBy( [ '1-expired' ] ) ) ).toEqual( [ 'expired.com' ] );
		expect( filterBy( [ '1-expired', '2-next-90-days' ] ).paginationInfo.totalItems ).toBe( 3 );
		expect( filterBy( [] ).data ).toHaveLength( DOMAINS.length );
		expect( filterBy( undefined ).data ).toHaveLength( DOMAINS.length );
	} );
} );
