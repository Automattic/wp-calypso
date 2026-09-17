/**
 * @jest-environment jsdom
 */
import { namePulseTldsQuery } from '@automattic/api-queries';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { NAME_PULSE_TLDS_FIXTURE } from '../../../test-helpers/factories/name-pulse';
import { queryClient, TestDomainSearch } from '../../../test-helpers/renderer';
import { NAME_PULSE_INITIAL_CHECK_SINGLE_WORD, NamePulseDomainStatus } from '../../helpers';
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

describe( 'useNamePulseSearch', () => {
	beforeEach( () => {
		nock.disableNetConnect();
		queryClient.clear();
		queryClient.setQueryData( namePulseTldsQuery().queryKey, NAME_PULSE_TLDS_FIXTURE );
	} );

	afterEach( () => nock.cleanAll() );

	it( 'renders a typed FQDN as a normal exact-grid row', async () => {
		nock( API )
			.persist()
			.post( AVAILABILITY_PATH )
			.reply( 200, { 'coffee.com': { is_available: true, cost: '$12.00', raw_price: 12 } } );

		const { result } = renderSearch( 'coffee.com' );

		await waitFor( () =>
			expect(
				statusOf( [ ...result.current.topResults, ...result.current.exactList ], 'coffee.com' )
			).toBe( NamePulseDomainStatus.AVAILABLE )
		);
	} );

	it( 'keeps rows of a failed batch in the grid as UNKNOWN and re-requests them on the next search', async () => {
		const failing = nock( API )
			.persist()
			.post( AVAILABILITY_PATH )
			.reply( 429, { error: 'rate_limited' } );

		const { result, rerender } = renderSearch( 'bakery' );
		const rowCount = () => result.current.topResults.length + result.current.exactList.length;

		expect( rowCount() ).toBe( NAME_PULSE_TLDS_FIXTURE.length );
		expect( NAME_PULSE_TLDS_FIXTURE.length ).toBeGreaterThan(
			NAME_PULSE_INITIAL_CHECK_SINGLE_WORD
		);
		expect( statusOf( result.current.exactList, 'bakery.net' ) ).toBe(
			NamePulseDomainStatus.WAITING
		);

		await waitFor( () =>
			expect( statusOf( result.current.exactList, 'bakery.net' ) ).toBe(
				NamePulseDomainStatus.UNKNOWN
			)
		);

		// Nothing slid into the first batch's place: the grid keeps its rows.
		expect( rowCount() ).toBe( NAME_PULSE_TLDS_FIXTURE.length );

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
} );
