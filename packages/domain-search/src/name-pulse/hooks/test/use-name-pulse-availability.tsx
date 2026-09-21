/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { queryClient, TestDomainSearch } from '../../../test-helpers/renderer';
import {
	NAME_PULSE_AVAILABILITY_BATCH_SIZE,
	NAME_PULSE_SKELETON_TIMEOUT_MS,
	NamePulseDomainStatus,
} from '../../helpers';
import { useNamePulseAvailability } from '../use-name-pulse-availability';

const API = 'https://public-api.wordpress.com';
const AVAILABILITY_PATH = '/wpcom/v2/domains/name-pulse/availability-check';

const renderAvailability = () => {
	const onUpdate = jest.fn();
	const hook = renderHook( () => useNamePulseAvailability( onUpdate ), {
		wrapper: ( { children } ) => <TestDomainSearch>{ children }</TestDomainSearch>,
	} );

	return { ...hook, onUpdate };
};

const statusesReported = ( onUpdate: jest.Mock ) =>
	onUpdate.mock.calls.map( ( [ update ] ) => [ update.domain_name, update.status ] );

const takenAll = ( _uri: string, body: { domain_names: string[] } ) =>
	Object.fromEntries( body.domain_names.map( ( name ) => [ name, { is_available: false } ] ) );

describe( 'useNamePulseAvailability', () => {
	beforeEach( () => {
		nock.disableNetConnect();
		queryClient.clear();
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.useRealTimers();
	} );

	it( 'requests batches of 36 names in parallel', async () => {
		const names = Array.from(
			{ length: NAME_PULSE_AVAILABILITY_BATCH_SIZE + 4 },
			( _, i ) => `test${ i }.com`
		);
		const [ large, small ] = [ NAME_PULSE_AVAILABILITY_BATCH_SIZE, 4 ].map( ( size ) =>
			nock( API )
				.post(
					AVAILABILITY_PATH,
					( body: { domain_names: string[] } ) => body.domain_names.length === size
				)
				.delay( size === 4 ? 0 : 50 )
				.reply( 200, takenAll )
		);

		const { result, onUpdate } = renderAvailability();

		act( () => {
			result.current.checkDomains( names );
		} );

		await waitFor( () => expect( onUpdate ).toHaveBeenCalledTimes( names.length ) );

		expect( large.isDone() ).toBe( true );
		expect( small.isDone() ).toBe( true );
		// The second batch did not wait for the first one to answer.
		expect( statusesReported( onUpdate ).slice( 0, 4 ) ).toEqual(
			names
				.slice( NAME_PULSE_AVAILABILITY_BATCH_SIZE )
				.map( ( name ) => [ name, NamePulseDomainStatus.TAKEN ] )
		);
	} );

	it( 'maps each entry to a status with its pricing, and a name the response leaves out to UNKNOWN', async () => {
		nock( API )
			.post( AVAILABILITY_PATH )
			.reply( 200, {
				'test.com': { is_available: false },
				'test.net': { is_available: true, cost: '$18.00', raw_price: 18 },
			} );

		const { result, onUpdate } = renderAvailability();

		act( () => {
			result.current.checkDomains( [ 'test.com', 'test.net', 'test.org' ] );
		} );

		await waitFor( () => expect( onUpdate ).toHaveBeenCalledTimes( 3 ) );

		expect( statusesReported( onUpdate ) ).toEqual( [
			[ 'test.com', NamePulseDomainStatus.TAKEN ],
			[ 'test.net', NamePulseDomainStatus.AVAILABLE ],
			[ 'test.org', NamePulseDomainStatus.UNKNOWN ],
		] );
		expect( onUpdate ).toHaveBeenCalledWith(
			expect.objectContaining( { domain_name: 'test.net', cost: '$18.00', raw_price: 18 } )
		);
	} );

	it( 'reports every name of a failed batch as UNKNOWN', async () => {
		nock( API ).post( AVAILABILITY_PATH ).reply( 429, { error: 'rate_limited' } );

		const { result, onUpdate } = renderAvailability();

		act( () => {
			result.current.checkDomains( [ 'test.com', 'test.net' ] );
		} );

		await waitFor( () => expect( onUpdate ).toHaveBeenCalledTimes( 2 ) );

		expect( statusesReported( onUpdate ) ).toEqual( [
			[ 'test.com', NamePulseDomainStatus.UNKNOWN ],
			[ 'test.net', NamePulseDomainStatus.UNKNOWN ],
		] );
	} );
	it( 'marks a batch UNKNOWN when no response arrives within the timeout', () => {
		jest.useFakeTimers();

		nock( API )
			.post( AVAILABILITY_PATH )
			.reply( 200, () => new Promise( () => {} ) );

		const { result, onUpdate } = renderAvailability();

		act( () => {
			result.current.checkDomains( [ 'test.com' ] );
		} );

		act( () => {
			jest.advanceTimersByTime( NAME_PULSE_SKELETON_TIMEOUT_MS - 1 );
		} );
		expect( onUpdate ).not.toHaveBeenCalled();

		act( () => {
			jest.advanceTimersByTime( 1 );
		} );

		expect( statusesReported( onUpdate ) ).toEqual( [
			[ 'test.com', NamePulseDomainStatus.UNKNOWN ],
		] );
	} );
} );
