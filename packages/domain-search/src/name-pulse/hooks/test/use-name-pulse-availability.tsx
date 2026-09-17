/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { queryClient, TestDomainSearch } from '../../../test-helpers/renderer';
import { NAME_PULSE_SKELETON_TIMEOUT_MS, NamePulseDomainStatus } from '../../helpers';
import { useNamePulseAvailability } from '../use-name-pulse-availability';

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

describe( 'useNamePulseAvailability', () => {
	beforeEach( () => {
		nock.disableNetConnect();
		queryClient.clear();
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.useRealTimers();
	} );

	it( 'reports each resolved domain', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( AVAILABILITY_PATH )
			.reply( 200, {
				'test.com': { is_available: false },
				'test.net': { is_available: true, cost: '$18.00', raw_price: 18 },
			} );

		const { result, onUpdate } = renderAvailability();

		act( () => {
			result.current.checkDomains( [ 'test.com', 'test.net' ] );
		} );

		await waitFor( () => expect( onUpdate ).toHaveBeenCalledTimes( 2 ) );

		expect( statusesReported( onUpdate ) ).toEqual( [
			[ 'test.com', NamePulseDomainStatus.TAKEN ],
			[ 'test.net', NamePulseDomainStatus.AVAILABLE ],
		] );
	} );

	it( 'marks a batch UNKNOWN when no response arrives within the timeout', async () => {
		jest.useFakeTimers();

		// Never replied: the interceptor stays pending for the whole test.
		nock( 'https://public-api.wordpress.com' )
			.post( AVAILABILITY_PATH )
			.delay( NAME_PULSE_SKELETON_TIMEOUT_MS * 10 )
			.reply( 200, {} );

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

	it( 'does not request a domain that is already in flight', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( AVAILABILITY_PATH )
			.delay( 50 )
			.reply( 200, { 'test.com': { is_available: false } } );

		const { result, onUpdate } = renderAvailability();

		act( () => {
			result.current.checkDomains( [ 'test.com' ] );
			result.current.checkDomains( [ 'test.com' ] );
		} );

		await waitFor( () => expect( onUpdate ).toHaveBeenCalledTimes( 1 ) );
		// A second request would have hit the disabled network and reported UNKNOWN.
		expect( statusesReported( onUpdate ) ).toEqual( [
			[ 'test.com', NamePulseDomainStatus.TAKEN ],
		] );
		expect( nock.isDone() ).toBe( true );
	} );

	it( 'does not fire the timeout after the batch has settled', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( AVAILABILITY_PATH )
			.reply( 200, { 'test.com': { is_available: false } } );

		const { result, onUpdate } = renderAvailability();

		act( () => {
			result.current.checkDomains( [ 'test.com' ] );
		} );

		await waitFor( () => expect( onUpdate ).toHaveBeenCalledTimes( 1 ) );

		jest.useFakeTimers();
		act( () => {
			jest.advanceTimersByTime( NAME_PULSE_SKELETON_TIMEOUT_MS * 2 );
		} );

		expect( onUpdate ).toHaveBeenCalledTimes( 1 );
	} );
} );
