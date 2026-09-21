/**
 * @jest-environment jsdom
 */
import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { DomainSearchContext, useDomainSearchContextValue } from '../../../page/context';
import { buildCart } from '../../../test-helpers/factories/cart';
import {
	buildNamePulseAvailabilityResponse,
	NAME_PULSE_TLDS_FIXTURE,
	withNamePulseQueries,
} from '../../../test-helpers/factories/name-pulse';
import { queryClient } from '../../../test-helpers/renderer';
import {
	NAME_PULSE_AVAILABILITY_BATCH_SIZE,
	NAME_PULSE_SKELETON_TIMEOUT_MS,
	NamePulseDomainStatus,
} from '../../helpers';
import {
	namePulseVerdictQueryKey,
	setNamePulseVerdict,
	useNamePulseVerdicts,
} from '../use-name-pulse-verdicts';
import type { NamePulseAvailabilityResponse } from '@automattic/api-core';

type Availability = ( domainNames: string[] ) => Promise< NamePulseAvailabilityResponse >;

const Wrapper = ( {
	availability,
	children,
}: {
	availability: Availability;
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
					suggestions: () => Promise.reject( new Error( 'not used' ) ),
					tlds: async () => NAME_PULSE_TLDS_FIXTURE,
					domainAvailability: () => Promise.reject( new Error( 'not used' ) ),
				} ) }
			>
				{ children }
			</DomainSearchContext.Provider>
		</QueryClientProvider>
	);
};

const deferred = < T, >() => {
	let resolve!: ( value: T ) => void;
	let reject!: ( error: Error ) => void;
	const promise = new Promise< T >( ( res, rej ) => {
		resolve = res;
		reject = rej;
	} );

	return { promise, resolve, reject };
};

const renderVerdicts = (
	names: string[],
	availability: Availability = async ( domainNames ) =>
		buildNamePulseAvailabilityResponse( domainNames ),
	enabled = true
) => {
	const fetcher = jest.fn( availability );
	const rendered = renderHook(
		( props: { names: string[]; enabled: boolean } ) =>
			useNamePulseVerdicts( props.names, props.enabled ),
		{
			initialProps: { names, enabled },
			wrapper: ( { children } ) => <Wrapper availability={ fetcher }>{ children }</Wrapper>,
		}
	);

	return { ...rendered, fetcher };
};

const flushBatches = () => act( () => Promise.resolve() );

describe( 'useNamePulseVerdicts', () => {
	beforeEach( () => {
		queryClient.clear();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'checks the names in parallel batches of 36 and maps each entry to a verdict with its pricing', async () => {
		const names = Array.from(
			{ length: NAME_PULSE_AVAILABILITY_BATCH_SIZE + 4 },
			( _, i ) => `test${ i }.com`
		);
		const large = deferred< NamePulseAvailabilityResponse >();
		const { result, fetcher } = renderVerdicts( names, ( domainNames ) =>
			domainNames.length === NAME_PULSE_AVAILABILITY_BATCH_SIZE
				? large.promise
				: Promise.resolve( {
						...buildNamePulseAvailabilityResponse( domainNames.slice( 1 ) ),
						[ domainNames[ 0 ] ]: { is_available: false },
					} )
		);

		expect( result.current[ 'test0.com' ] ).toEqual( { isUnknown: false } );

		await flushBatches();
		expect( fetcher ).toHaveBeenCalledTimes( 2 );
		expect( fetcher.mock.calls[ 0 ][ 0 ] ).toHaveLength( NAME_PULSE_AVAILABILITY_BATCH_SIZE );
		expect( fetcher.mock.calls[ 1 ][ 0 ] ).toHaveLength( 4 );

		// The small batch did not wait for the large one.
		await waitFor( () =>
			expect( result.current[ 'test36.com' ]?.verdict ).toEqual( {
				status: NamePulseDomainStatus.TAKEN,
			} )
		);
		expect( result.current[ 'test37.com' ]?.verdict ).toEqual( {
			status: NamePulseDomainStatus.AVAILABLE,
			cost: '$24.00',
			raw_price: 24,
			currency_code: 'USD',
			sale_cost: undefined,
			is_premium: false,
		} );
		expect( result.current[ 'test0.com' ] ).toEqual( { isUnknown: false } );

		large.resolve( buildNamePulseAvailabilityResponse( names ) );
		await waitFor( () =>
			expect( result.current[ 'test0.com' ]?.verdict?.status ).toBe(
				NamePulseDomainStatus.AVAILABLE
			)
		);
	} );

	it( 'reports a name the response leaves out and every name of a failed batch as UNKNOWN, and caches neither', async () => {
		const { result, rerender } = renderVerdicts( [ 'test.com', 'test.net' ], async () => ( {
			'test.com': { is_available: false },
		} ) );

		await waitFor( () => expect( result.current[ 'test.net' ]?.isUnknown ).toBe( true ) );
		expect( result.current[ 'test.com' ]?.verdict?.status ).toBe( NamePulseDomainStatus.TAKEN );
		expect( queryClient.getQueryData( namePulseVerdictQueryKey( 'test.net' ) ) ).toBeUndefined();

		const failing = renderVerdicts( [ 'test.org' ], () =>
			Promise.reject( new Error( 'rate_limited' ) )
		);

		await waitFor( () => expect( failing.result.current[ 'test.org' ]?.isUnknown ).toBe( true ) );
		expect( queryClient.getQueryData( namePulseVerdictQueryKey( 'test.org' ) ) ).toBeUndefined();

		rerender( { names: [ 'test.com' ], enabled: true } );
		expect( result.current[ 'test.net' ] ).toBeUndefined();
	} );

	it( 'marks a batch UNKNOWN when no response arrives within the timeout, and a late response still lands', async () => {
		jest.useFakeTimers();
		const late = deferred< NamePulseAvailabilityResponse >();
		const { result } = renderVerdicts( [ 'test.com' ], () => late.promise );

		await flushBatches();
		await act( async () => {
			jest.advanceTimersByTime( NAME_PULSE_SKELETON_TIMEOUT_MS - 1 );
		} );
		expect( result.current[ 'test.com' ] ).toEqual( { isUnknown: false } );

		await act( async () => {
			jest.advanceTimersByTime( 1 );
		} );
		await waitFor( () => expect( result.current[ 'test.com' ]?.isUnknown ).toBe( true ) );

		late.resolve( { 'test.com': { is_available: false } } );
		await waitFor( () =>
			expect( result.current[ 'test.com' ]?.verdict ).toEqual( {
				status: NamePulseDomainStatus.TAKEN,
			} )
		);
	} );

	it( 'serves a name that leaves and comes back from the cache: no second request and never WAITING', async () => {
		const { result, rerender, fetcher } = renderVerdicts( [ 'test.com', 'test.net' ] );

		await waitFor( () =>
			expect( result.current[ 'test.com' ]?.verdict?.status ).toBe(
				NamePulseDomainStatus.AVAILABLE
			)
		);
		expect( fetcher ).toHaveBeenCalledTimes( 1 );

		rerender( { names: [ 'test.net' ], enabled: true } );
		expect( result.current[ 'test.com' ] ).toBeUndefined();

		rerender( { names: [ 'test.com', 'test.net', 'test.org' ], enabled: true } );
		expect( result.current[ 'test.com' ]?.verdict?.status ).toBe( NamePulseDomainStatus.AVAILABLE );

		await waitFor( () =>
			expect( result.current[ 'test.org' ]?.verdict?.status ).toBe(
				NamePulseDomainStatus.AVAILABLE
			)
		);
		expect( fetcher ).toHaveBeenCalledTimes( 2 );
		expect( fetcher.mock.calls[ 1 ][ 0 ] ).toEqual( [ 'test.org' ] );
	} );

	it( 'does not request anything while disabled and checks the names once enabled', async () => {
		const { result, rerender, fetcher } = renderVerdicts( [ 'test.com' ], undefined, false );

		await flushBatches();
		expect( fetcher ).not.toHaveBeenCalled();
		expect( result.current[ 'test.com' ] ).toEqual( { isUnknown: false } );

		rerender( { names: [ 'test.com' ], enabled: true } );
		await waitFor( () => expect( fetcher ).toHaveBeenCalledTimes( 1 ) );
	} );

	it( 'never lets a bulk verdict overwrite a real-time one, whether it lands before or after it', async () => {
		const bulk = deferred< NamePulseAvailabilityResponse >();
		const { result } = renderVerdicts( [ 'test.com' ], () => bulk.promise );
		const realtime = { status: NamePulseDomainStatus.TAKEN, is_realtime: true } as const;

		await flushBatches();
		setNamePulseVerdict( queryClient, 'test.com', realtime );
		await waitFor( () => expect( result.current[ 'test.com' ]?.verdict ).toEqual( realtime ) );

		bulk.resolve( { 'test.com': { is_available: true, cost: '$12.00' } } );
		await waitFor( () =>
			expect(
				queryClient.getQueryState( namePulseVerdictQueryKey( 'test.com' ) )?.fetchStatus
			).toBe( 'idle' )
		);
		expect( result.current[ 'test.com' ]?.verdict ).toEqual( realtime );

		setNamePulseVerdict( queryClient, 'test.com', {
			status: NamePulseDomainStatus.AVAILABLE,
			cost: '$12.00',
		} );
		await waitFor( () =>
			expect( queryClient.getQueryData( namePulseVerdictQueryKey( 'test.com' ) ) ).toEqual(
				realtime
			)
		);
	} );
} );
