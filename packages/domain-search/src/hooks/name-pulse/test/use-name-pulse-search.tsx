/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	NAME_PULSE_INITIAL_CHECK_SINGLE_WORD,
	NAME_PULSE_SKELETON_TIMEOUT_MS,
	NamePulseDomainStatus,
} from '../../../helpers/name-pulse';
import { queryClient, TestDomainSearch } from '../../../test-helpers/renderer';
import { useNamePulseSearch } from '../use-name-pulse-search';

const API = 'https://public-api.wordpress.com';
const AVAILABILITY_PATH = '/wpcom/v2/domains/name-pulse/availability-check';

const renderSearch = ( query: string ) =>
	renderHook( ( { q }: { q: string } ) => useNamePulseSearch( q ), {
		initialProps: { q: query },
		wrapper: ( { children } ) => <TestDomainSearch>{ children }</TestDomainSearch>,
	} );

const statusOf = ( rows: { domain_name: string; status: NamePulseDomainStatus }[], name: string ) =>
	rows.find( ( row ) => row.domain_name === name )?.status;

describe( 'useNamePulseSearch availability failures', () => {
	beforeEach( () => {
		nock.disableNetConnect();
		queryClient.clear();
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.useRealTimers();
	} );

	it( 'keeps rows of a failed batch in the grid as UNKNOWN and re-requests them on the next search', async () => {
		const failing = nock( API )
			.persist()
			.post( AVAILABILITY_PATH )
			.reply( 429, { error: 'rate_limited' } );

		const { result, rerender } = renderSearch( 'bakery' );
		const initialCount = result.current.exactList.length;

		expect( initialCount ).toBeGreaterThan( NAME_PULSE_INITIAL_CHECK_SINGLE_WORD );
		expect( statusOf( result.current.exactList, 'bakery.net' ) ).toBe(
			NamePulseDomainStatus.WAITING
		);

		await waitFor( () =>
			expect( statusOf( result.current.exactList, 'bakery.net' ) ).toBe(
				NamePulseDomainStatus.UNKNOWN
			)
		);

		// Nothing slid into the first batch's place: the grid keeps its rows.
		expect( result.current.exactList ).toHaveLength( initialCount );

		// Top results backfill from unchecked rows, which get requested in turn
		// and fail too, until no candidate is left.
		await waitFor( () => expect( result.current.topResults ).toHaveLength( 0 ), {
			timeout: 5000,
		} );

		nock.removeInterceptor( failing );
		nock.cleanAll();
		const recovery = nock( API )
			.post( AVAILABILITY_PATH, ( body: { domain_names: string[] } ) =>
				body.domain_names.includes( 'bakery.net' )
			)
			.reply( 200, { 'bakery.net': { is_available: true, cost: '$22.00', raw_price: 22 } } );

		// Same label again: the UNKNOWN rows are requested a second time.
		rerender( { q: 'bakeryx' } );
		rerender( { q: 'bakery' } );

		await waitFor( () => expect( recovery.isDone() ).toBe( true ) );
		// The only available row is promoted to Top results (and deduplicated
		// out of Exact match).
		await waitFor( () =>
			expect(
				statusOf( [ ...result.current.topResults, ...result.current.exactList ], 'bakery.net' )
			).toBe( NamePulseDomainStatus.AVAILABLE )
		);
	} );

	it( 'flips the batch to UNKNOWN when no response arrives within the timeout', () => {
		jest.useFakeTimers();
		nock( API )
			.persist()
			.post( AVAILABILITY_PATH )
			.delay( NAME_PULSE_SKELETON_TIMEOUT_MS * 10 )
			.reply( 200, {} );

		const { result } = renderSearch( 'bakery' );
		expect( statusOf( result.current.exactList, 'bakery.net' ) ).toBe(
			NamePulseDomainStatus.WAITING
		);

		act( () => {
			jest.advanceTimersByTime( NAME_PULSE_SKELETON_TIMEOUT_MS );
		} );

		expect( statusOf( result.current.exactList, 'bakery.net' ) ).toBe(
			NamePulseDomainStatus.UNKNOWN
		);
		expect(
			result.current.exactList.filter( ( row ) => row.status === NamePulseDomainStatus.UNKNOWN )
		).toHaveLength( NAME_PULSE_INITIAL_CHECK_SINGLE_WORD );
	} );
} );
