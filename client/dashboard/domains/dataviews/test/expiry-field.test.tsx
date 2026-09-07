/**
 * @jest-environment jsdom
 */
import { DomainStatus, DomainSubtype } from '@automattic/api-core';
import { waitFor } from '@testing-library/react';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import { render } from '../../../test-utils';
import { sanitizeFields, useFields } from '../fields';
import { DEFAULT_VIEW } from '../views';
import type { DomainSummary } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

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
	domain( 'middle.com', '2026-06-15' ),
	domain( 'no-date.com', null ),
	domain( 'latest.com', '2028-01-01' ),
	domain( 'earliest.com', '2025-02-01' ),
];

const DATED_ONLY = DOMAINS.filter( ( item ) => item.expiry !== null );

const FILTERABLE = [
	domain( 'expired.com', '2024-01-01', { expired: true } ),
	domain( 'soon.com', new Date( Date.now() + 30 * 24 * 60 * 60 * 1000 ).toISOString() ),
	domain( 'later.com', new Date( Date.now() + 365 * 24 * 60 * 60 * 1000 ).toISOString() ),
	domain( 'no-date.com', null ),
];

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

type AppQueries = typeof APP_CONTEXT_DEFAULT_CONFIG.queries;

const sortedNames = (
	fields: Field< DomainSummary >[],
	direction: 'asc' | 'desc',
	items: DomainSummary[] = DOMAINS
) => {
	const view: View = { ...DEFAULT_VIEW, perPage: 100, sort: { field: 'expiry_date', direction } };
	const { data } = filterSortAndPaginate( items, view, fields );
	return data.map( ( item ) => item.domain );
};

const filteredNames = ( fields: Field< DomainSummary >[], value: string ) => {
	const view: View = {
		...DEFAULT_VIEW,
		perPage: 100,
		filters: [ { field: 'expiry', operator: 'isAny', value: [ value ] } ],
	};
	const { data } = filterSortAndPaginate( FILTERABLE, view, fields );
	return data.map( ( item ) => item.domain );
};

describe( 'domains "Paid until" field', () => {
	it( 'orders dated rows by expiry date', async () => {
		const getFields = renderFields();
		await waitFor( () => expect( getFields().length ).toBeGreaterThan( 0 ) );

		expect( sortedNames( getFields(), 'asc', DATED_ONLY ) ).toEqual( [
			'earliest.com',
			'middle.com',
			'latest.com',
		] );
	} );

	it( 'orders rows by expiry date and keeps undated domains last', async () => {
		const getFields = renderFields();
		await waitFor( () => expect( getFields().length ).toBeGreaterThan( 0 ) );

		expect( sortedNames( getFields(), 'asc' ) ).toEqual( [
			'earliest.com',
			'middle.com',
			'latest.com',
			'no-date.com',
		] );

		expect( sortedNames( getFields(), 'desc' ) ).toEqual( [
			'latest.com',
			'middle.com',
			'earliest.com',
			'no-date.com',
		] );
	} );
	it( 'filters by expiry status', async () => {
		const getFields = renderFields();
		await waitFor( () => expect( getFields().length ).toBeGreaterThan( 0 ) );

		expect( filteredNames( getFields(), '1-expired' ) ).toEqual( [ 'expired.com' ] );
		expect( filteredNames( getFields(), '2-next-90-days' ) ).toEqual( [ 'soon.com' ] );
	} );
} );

describe( 'sanitizeFields', () => {
	it( 'migrates a persisted expiry column to the date column', () => {
		expect( sanitizeFields( [ 'blog_name', 'expiry', 'domain_status' ] ) ).toEqual( [
			'blog_name',
			'expiry_date',
			'domain_status',
		] );
	} );
} );
