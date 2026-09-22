/**
 * @jest-environment jsdom
 */
import { namePulseTldsQuery } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { DomainSearchContext, useDomainSearchContextValue } from '../../../page/context';
import { buildCart } from '../../../test-helpers/factories/cart';
import {
	buildNamePulseAvailabilityResponse,
	NAME_PULSE_AI_SUGGESTIONS_FIXTURE,
	NAME_PULSE_SUGGESTIONS_FIXTURE,
	NAME_PULSE_TLDS_FIXTURE,
	withNamePulseQueries,
} from '../../../test-helpers/factories/name-pulse';
import { queryClient, TestDomainSearch } from '../../../test-helpers/renderer';
import {
	NAME_PULSE_AI_TIMEOUT_MS,
	NAME_PULSE_QUERY_SETTLE_MS,
	NamePulseDomainStatus,
} from '../../helpers';
import { useNamePulseSearch } from '../use-name-pulse-search';
import type {
	NamePulseAvailabilityResponse,
	NamePulseSuggestionsQuery,
	NamePulseSuggestionsResponse,
} from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';
const AVAILABILITY_PATH = '/wpcom/v2/domains/name-pulse/availability-check';

const renderSearch = ( query: string ) =>
	renderHook( ( { q }: { q: string } ) => useNamePulseSearch( q ), {
		initialProps: { q: query },
		wrapper: ( { children } ) => <TestDomainSearch>{ children }</TestDomainSearch>,
	} );

const FetcherSearch = ( {
	availability,
	suggestions,
	children,
}: {
	availability: ( domainNames: string[] ) => Promise< NamePulseAvailabilityResponse >;
	suggestions: ( params: NamePulseSuggestionsQuery ) => Promise< NamePulseSuggestionsResponse >;
	children: React.ReactNode;
} ) => {
	const contextValue = useDomainSearchContextValue( {
		cart: buildCart(),
		config: { showNamePulseSearch: true },
	} );

	return (
		<QueryClientProvider client={ queryClient }>
			<DomainSearchContext.Provider
				value={ withNamePulseQueries( contextValue, {
					availability,
					suggestions,
					tlds: async () => NAME_PULSE_TLDS_FIXTURE,
					domainAvailability: () => Promise.reject( new Error( 'not used' ) ),
				} ) }
			>
				{ children }
			</DomainSearchContext.Provider>
		</QueryClientProvider>
	);
};

const renderTypedSearch = ( query: string ) => {
	const availability = jest.fn( async ( domainNames: string[] ) =>
		buildNamePulseAvailabilityResponse( domainNames )
	);
	const suggestions = jest.fn( async ( params: NamePulseSuggestionsQuery ) => ( {
		suggestions: params.use_ai ? NAME_PULSE_AI_SUGGESTIONS_FIXTURE : NAME_PULSE_SUGGESTIONS_FIXTURE,
		errors: [],
	} ) );
	const rendered = renderHook( ( { q }: { q: string } ) => useNamePulseSearch( q ), {
		initialProps: { q: query },
		wrapper: ( { children } ) => (
			<FetcherSearch availability={ availability } suggestions={ suggestions }>
				{ children }
			</FetcherSearch>
		),
	} );

	return { ...rendered, availability, suggestions };
};

// Async so the availability batch, which flushes on a microtask, goes out.
const advance = ( ms: number ) =>
	act( async () => {
		jest.advanceTimersByTime( ms );
	} );

const statusOf = ( result: ReturnType< typeof renderSearch >[ 'result' ], name: string ) =>
	[ ...result.current.topResults, ...result.current.exactList ].find(
		( row ) => row.domain_name === name
	)?.status;

describe( 'useNamePulseSearch', () => {
	beforeEach( () => {
		nock.disableNetConnect();
		queryClient.clear();
		queryClient.setQueryData( namePulseTldsQuery().queryKey, NAME_PULSE_TLDS_FIXTURE );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.useRealTimers();
	} );

	it( 'keeps the status of a row a refined query still lists and only requests the new rows', async () => {
		const requests: string[][] = [];
		nock( API )
			.persist()
			.post( AVAILABILITY_PATH )
			.reply( 200, ( _uri, body: { domain_names: string[] } ) => {
				requests.push( body.domain_names );

				return Object.fromEntries(
					body.domain_names.map( ( name ) => [
						name,
						{ is_available: true, cost: '$12.00', raw_price: 12 },
					] )
				);
			} );

		const { result, rerender } = renderSearch( 'test' );

		await waitFor( () =>
			expect( statusOf( result, 'test.com' ) ).toBe( NamePulseDomainStatus.AVAILABLE )
		);
		expect( requests ).toHaveLength( 1 );

		rerender( { q: 'testcom' } );

		expect( statusOf( result, 'test.com' ) ).toBe( NamePulseDomainStatus.AVAILABLE );
		expect( statusOf( result, 'testcom.blog' ) ).toBe( NamePulseDomainStatus.WAITING );

		await waitFor( () => expect( requests ).toHaveLength( 2 ) );
		expect( requests[ 1 ] ).toContain( 'testcom.blog' );
		expect( requests[ 1 ] ).not.toContain( 'test.com' );

		await waitFor( () =>
			expect( statusOf( result, 'testcom.blog' ) ).toBe( NamePulseDomainStatus.AVAILABLE )
		);
	} );

	it( 'regenerates the rows on every keystroke and checks availability once the query settles', async () => {
		jest.useFakeTimers();
		const { result, rerender, availability } = renderTypedSearch( 'a' );
		const rows = () => [ ...result.current.topResults, ...result.current.exactList ];

		expect( rows() ).toHaveLength( 0 );

		rerender( { q: 'ab' } );
		expect( result.current.layout.baseName ).toBe( 'ab' );
		expect( rows().map( ( row ) => row.status ) ).toContain( NamePulseDomainStatus.WAITING );

		rerender( { q: 'abc' } );
		expect( result.current.layout.baseName ).toBe( 'abc' );
		expect( rows().find( ( row ) => row.domain_name === 'abc.com' )?.status ).toBe(
			NamePulseDomainStatus.WAITING
		);

		await advance( NAME_PULSE_QUERY_SETTLE_MS - 1 );
		expect( availability ).not.toHaveBeenCalled();

		await advance( 1 );
		expect( availability ).toHaveBeenCalledTimes( 1 );
		expect( availability.mock.calls[ 0 ][ 0 ] ).toContain( 'abc.com' );
		expect( availability.mock.calls[ 0 ][ 0 ] ).not.toContain( 'ab.com' );

		await waitFor( () =>
			expect( rows().find( ( row ) => row.domain_name === 'abc.com' )?.status ).toBe(
				NamePulseDomainStatus.AVAILABLE
			)
		);
		expect( availability ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'serves a name that leaves the grid and comes back from the cache: no second request and never WAITING', async () => {
		jest.useFakeTimers();
		const { result, rerender, availability } = renderTypedSearch( 'test' );

		await advance( NAME_PULSE_QUERY_SETTLE_MS );
		await waitFor( () =>
			expect( statusOf( result, 'test.com' ) ).toBe( NamePulseDomainStatus.AVAILABLE )
		);
		expect( availability ).toHaveBeenCalledTimes( 1 );

		rerender( { q: 'tests' } );
		expect( statusOf( result, 'test.com' ) ).toBeUndefined();
		await advance( NAME_PULSE_QUERY_SETTLE_MS );
		expect( availability ).toHaveBeenCalledTimes( 2 );

		rerender( { q: 'test' } );
		expect( statusOf( result, 'test.com' ) ).toBe( NamePulseDomainStatus.AVAILABLE );
		expect( statusOf( result, 'test.blog' ) ).toBe( NamePulseDomainStatus.AVAILABLE );

		await advance( NAME_PULSE_QUERY_SETTLE_MS );
		expect( availability ).toHaveBeenCalledTimes( 2 );
		expect( statusOf( result, 'test.com' ) ).toBe( NamePulseDomainStatus.AVAILABLE );
	} );

	it( 'reports the keyword section as loading while typing and fetches once for the settled query', async () => {
		jest.useFakeTimers();
		const { result, rerender, suggestions } = renderTypedSearch( 'ice' );

		expect( result.current.isLoadingKeyword ).toBe( false );

		rerender( { q: 'ice c' } );
		rerender( { q: 'ice cr' } );
		rerender( { q: 'ice cream' } );
		expect( result.current.isLoadingKeyword ).toBe( true );
		expect( result.current.keywordResults ).toHaveLength( 0 );

		await advance( NAME_PULSE_QUERY_SETTLE_MS - 1 );
		expect( suggestions ).not.toHaveBeenCalled();

		await advance( 1 );
		expect( suggestions ).toHaveBeenCalledTimes( 1 );

		await waitFor( () =>
			expect( result.current.keywordResults.map( ( row ) => row.domain_name ) ).toContain(
				'creamyice.com'
			)
		);
		expect( result.current.isLoadingKeyword ).toBe( false );
		expect( suggestions ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'mounts Creative matches on the fourth word but collapses the exact grid only once the query settles', async () => {
		jest.useFakeTimers();
		const { result, rerender, availability, suggestions } = renderTypedSearch( 'a blog about' );

		await advance( NAME_PULSE_QUERY_SETTLE_MS );
		await waitFor( () =>
			expect( statusOf( result, 'ablogabout.com' ) ).toBe( NamePulseDomainStatus.AVAILABLE )
		);
		await waitFor( () => expect( result.current.isLoadingKeyword ).toBe( false ) );
		expect( result.current.layout.exactGrid.show ).toBe( true );
		expect( result.current.layout.creative.show ).toBe( false );

		rerender( { q: 'a blog about icecream' } );
		expect( result.current.layout.creative.show ).toBe( true );
		expect( result.current.isLoadingCreative ).toBe( true );
		expect( result.current.layout.exactGrid.show ).toBe( true );
		expect( suggestions ).not.toHaveBeenCalledWith( expect.objectContaining( { use_ai: true } ) );

		const checksBeforeSettle = availability.mock.calls.length;
		await advance( NAME_PULSE_QUERY_SETTLE_MS );
		expect( result.current.layout.exactGrid.show ).toBe( false );
		expect( result.current.exactList ).toHaveLength( 0 );
		expect( suggestions ).toHaveBeenCalledWith( {
			query: 'a blog about icecream',
			use_ai: true,
			timeout: NAME_PULSE_AI_TIMEOUT_MS,
		} );

		await waitFor( () => expect( result.current.isLoadingTop ).toBe( false ) );
		expect( result.current.topResults ).toHaveLength( 3 );
		expect( result.current.creativeResults.length ).toBeGreaterThan( 0 );
		// The collapsed grid's rows for the four-word name are never checked.
		expect( availability ).toHaveBeenCalledTimes( checksBeforeSettle );

		rerender( { q: 'a blog about' } );
		expect( result.current.layout.creative.show ).toBe( false );
		expect( result.current.layout.exactGrid.show ).toBe( false );

		await advance( NAME_PULSE_QUERY_SETTLE_MS );
		expect( result.current.layout.exactGrid.show ).toBe( true );
		await waitFor( () =>
			expect( statusOf( result, 'ablogabout.com' ) ).toBe( NamePulseDomainStatus.AVAILABLE )
		);
	} );
} );
