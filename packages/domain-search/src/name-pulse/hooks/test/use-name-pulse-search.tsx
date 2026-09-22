/**
 * @jest-environment jsdom
 */
import { namePulseTldsQuery } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { DomainSearchContext, useDomainSearchContextValue } from '../../../page/context';
import { buildAvailability } from '../../../test-helpers/factories/availability';
import { buildCart } from '../../../test-helpers/factories/cart';
import {
	buildNamePulseAvailabilityResponse,
	NAME_PULSE_SUGGESTIONS_FIXTURE,
	NAME_PULSE_TLDS_FIXTURE,
	withNamePulseQueries,
} from '../../../test-helpers/factories/name-pulse';
import { queryClient, TestDomainSearch } from '../../../test-helpers/renderer';
import { NAME_PULSE_QUERY_SETTLE_MS, NamePulseDomainStatus } from '../../helpers';
import { useNamePulseSearch } from '../use-name-pulse-search';
import type {
	DomainAvailability,
	NamePulseAvailabilityResponse,
	NamePulseSuggestionsResponse,
} from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';
const AVAILABILITY_PATH = '/wpcom/v2/domains/name-pulse/availability-check';

const stubBulkAvailability = () =>
	nock( API )
		.persist()
		.post( AVAILABILITY_PATH )
		.reply( 200, ( _uri, body: { domain_names: string[] } ) =>
			Object.fromEntries( body.domain_names.map( ( name ) => [ name, { is_available: true } ] ) )
		);

const renderSearch = ( query: string ) =>
	renderHook( ( { q }: { q: string } ) => useNamePulseSearch( q ), {
		initialProps: { q: query },
		wrapper: ( { children } ) => <TestDomainSearch>{ children }</TestDomainSearch>,
	} );

const FetcherSearch = ( {
	availability,
	suggestions,
	domainAvailability,
	children,
}: {
	availability: ( domainNames: string[] ) => Promise< NamePulseAvailabilityResponse >;
	suggestions: () => Promise< NamePulseSuggestionsResponse >;
	domainAvailability: ( domainName: string ) => Promise< DomainAvailability >;
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
					domainAvailability,
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
	const suggestions = jest.fn( async () => ( {
		suggestions: NAME_PULSE_SUGGESTIONS_FIXTURE,
		errors: [],
	} ) );
	const domainAvailability = jest.fn( async ( domainName: string ) =>
		buildAvailability( { domain_name: domainName } )
	);
	const rendered = renderHook( ( { q }: { q: string } ) => useNamePulseSearch( q ), {
		initialProps: { q: query },
		wrapper: ( { children } ) => (
			<FetcherSearch
				availability={ availability }
				suggestions={ suggestions }
				domainAvailability={ domainAvailability }
			>
				{ children }
			</FetcherSearch>
		),
	} );

	return { ...rendered, availability, suggestions, domainAvailability };
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

	it( 'waits for the query to settle before checking a typed domain or showing a notice', async () => {
		jest.useFakeTimers();
		const { result, rerender, domainAvailability } = renderTypedSearch( 'icecream' );

		await advance( NAME_PULSE_QUERY_SETTLE_MS );
		rerender( { q: 'icecream.c' } );
		rerender( { q: 'icecream.co' } );
		rerender( { q: 'icecream.com' } );

		expect( result.current.notice ).toBeNull();
		expect( domainAvailability ).not.toHaveBeenCalled();

		await advance( NAME_PULSE_QUERY_SETTLE_MS );

		expect( domainAvailability ).toHaveBeenCalledTimes( 1 );
		expect( domainAvailability ).toHaveBeenCalledWith( 'icecream.com' );
	} );

	it( 'reports a typed domain that is registered elsewhere', async () => {
		stubBulkAvailability();
		nock( API )
			.get( '/rest/v1.3/domains/icecream.com/is-available' )
			.query( true )
			.reply( 200, { status: 'transferrable', domain_name: 'icecream.com', tld: 'com' } );

		const { result } = renderSearch( 'icecream.com' );

		await waitFor( () =>
			expect( result.current.notice ).toEqual( {
				status: 'neutral',
				message: 'This domain is already registered.',
				transferDomain: 'icecream.com',
			} )
		);
	} );

	it( 'explains an unrecognised ending without a real-time check', async () => {
		stubBulkAvailability();
		const realTimeCheck = nock( API )
			.get( /is-available/ )
			.query( true )
			.reply( 200, {} );

		const { result } = renderSearch( 'icecream.d' );

		await waitFor( () =>
			expect( result.current.notice?.message ).toBe(
				'We don’t recognize .d, so we’re showing results for “icecreamd”. Try .com or .blog instead.'
			)
		);
		await waitFor( () =>
			expect( result.current.topResults[ 0 ].status ).toBe( NamePulseDomainStatus.AVAILABLE )
		);
		expect( realTimeCheck.isDone() ).toBe( false );
	} );
} );
