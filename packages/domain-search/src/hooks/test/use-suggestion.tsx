/**
 * @jest-environment jsdom
 */
import { DomainAvailabilityStatus } from '@automattic/api-core';
import { useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { useDomainSearch } from '../../page/context';
import { buildAvailability } from '../../test-helpers/factories/availability';
import { buildSuggestion } from '../../test-helpers/factories/suggestions';
import { mockGetAvailabilityQuery } from '../../test-helpers/queries/availability';
import {
	mockGetSuggestionsQuery,
	mockGetSuggestionsQueryEmptyResults,
} from '../../test-helpers/queries/suggestions';
import { queryClient, TestDomainSearch } from '../../test-helpers/renderer';
import { DomainPriceRule, useSuggestion } from '../use-suggestion';
import type { DomainSearchConfig } from '../../page/types';

// Cards only mount once useSuggestionsList has fetched the list, so fetch both
// queries the hook reads and hold it back until they've settled.
const SettledQueries = ( {
	domainName,
	children,
}: {
	domainName: string;
	children: React.ReactNode;
} ) => {
	const { query, queries } = useDomainSearch();
	const suggestions = useQuery( { ...queries.domainSuggestions( query ), enabled: true } );
	const availability = useQuery( { ...queries.domainAvailability( domainName ), enabled: true } );

	if ( suggestions.isPending || availability.isPending ) {
		return null;
	}

	return children;
};

const renderUseSuggestion = (
	domainName: string,
	{ query = domainName, config }: { query?: string; config?: Partial< DomainSearchConfig > } = {}
) =>
	renderHook( () => useSuggestion( domainName ), {
		wrapper: ( { children } ) => (
			<TestDomainSearch query={ query } config={ config }>
				<SettledQueries domainName={ domainName }>{ children }</SettledQueries>
			</TestDomainSearch>
		),
	} );

describe( 'useSuggestion', () => {
	afterEach( () => {
		nock.cleanAll();
		queryClient.clear();
	} );

	it( 'returns the FQDN availability as the first suggestion when the suggestions request fails', async () => {
		mockGetSuggestionsQueryEmptyResults( { params: { query: 'foo.live' } } );
		mockGetAvailabilityQuery( {
			params: { domainName: 'foo.live' },
			availability: buildAvailability( {
				domain_name: 'foo.live',
				tld: 'live',
				status: DomainAvailabilityStatus.AVAILABLE,
			} ),
		} );

		const { result } = renderUseSuggestion( 'foo.live' );

		await waitFor( () => expect( result.current ).not.toBeNull() );

		expect( result.current.domain_name ).toBe( 'foo.live' );
		expect( result.current.position ).toBe( 0 );
		expect( result.current.price_rule ).toBe( DomainPriceRule.PRICE );
	} );

	it( 'returns the suggestion with its position and price rule', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'test' },
			suggestions: [
				buildSuggestion( { domain_name: 'test.com' } ),
				buildSuggestion( { domain_name: 'test.net' } ),
			],
		} );
		mockGetAvailabilityQuery( {
			params: { domainName: 'test.net' },
			availability: buildAvailability( { domain_name: 'test.net', tld: 'net' } ),
		} );

		const { result } = renderUseSuggestion( 'test.net', {
			query: 'test',
			config: { priceRules: { freeForFirstYear: true } },
		} );

		await waitFor( () => expect( result.current ).not.toBeNull() );

		expect( result.current.domain_name ).toBe( 'test.net' );
		expect( result.current.position ).toBe( 1 );
		expect( result.current.price_rule ).toBe( DomainPriceRule.FREE_FOR_FIRST_YEAR );
	} );

	it( 'prepends the FQDN availability when it is not in the suggestions list', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'test.com' },
			suggestions: [
				buildSuggestion( { domain_name: 'test.net' } ),
				buildSuggestion( { domain_name: 'test.org' } ),
			],
		} );
		mockGetAvailabilityQuery( {
			params: { domainName: 'test.com' },
			availability: buildAvailability( { domain_name: 'test.com' } ),
		} );

		const { result } = renderUseSuggestion( 'test.com' );

		await waitFor( () => expect( result.current ).not.toBeNull() );

		expect( result.current.domain_name ).toBe( 'test.com' );
		expect( result.current.position ).toBe( 0 );
		expect( result.current.price_rule ).toBe( DomainPriceRule.PRICE );
	} );

	it( 'does not add the FQDN availability to the cached suggestions', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'test.com' },
			suggestions: [ buildSuggestion( { domain_name: 'test.net' } ) ],
		} );
		mockGetAvailabilityQuery( {
			params: { domainName: 'test.com' },
			availability: buildAvailability( { domain_name: 'test.com' } ),
		} );

		const { result } = renderUseSuggestion( 'test.com' );

		await waitFor( () => expect( result.current ).not.toBeNull() );

		const [ cachedSuggestions ] = queryClient
			.getQueryCache()
			.findAll( { queryKey: [ 'domain-suggestions' ] } )
			.map( ( query ) => query.state.data as { domain_name: string }[] );

		expect( cachedSuggestions.map( ( { domain_name } ) => domain_name ) ).toEqual( [ 'test.net' ] );
	} );
} );
