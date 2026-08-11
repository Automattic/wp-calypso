/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { useCanConnectToZendeskMessaging } from '../src/use-can-connect-to-zendesk-messaging';
import type { ReactNode } from 'react';

jest.mock( '@automattic/calypso-analytics', () => ( {
	...jest.requireActual( '@automattic/calypso-analytics' ),
	recordTracksEvent: jest.fn(),
} ) );

const REQUEST_EVENT = 'calypso_helpcenter_zendesk_config_request';
const ERROR_EVENT = 'calypso_helpcenter_zendesk_config_error';
const REPORTING_VERSION = 2;
const fetchMock = jest.fn();
const originalFetch = globalThis.fetch;

function makeResponse( data: boolean ) {
	return { json: () => Promise.resolve( data ) };
}

function makeQueryClient() {
	return new QueryClient();
}

function makeWrapper( queryClient: QueryClient, strictMode = false ) {
	return function Wrapper( { children }: { children: ReactNode } ) {
		const content = strictMode ? <StrictMode>{ children }</StrictMode> : children;

		return <QueryClientProvider client={ queryClient }>{ content }</QueryClientProvider>;
	};
}

function getEventCalls( eventName: string ) {
	return ( recordTracksEvent as jest.Mock ).mock.calls.filter( ( [ name ] ) => name === eventName );
}

describe( 'useCanConnectToZendeskMessaging', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		fetchMock.mockReset();
		fetchMock.mockResolvedValue( makeResponse( true ) );
		globalThis.fetch = fetchMock as unknown as typeof fetch;
	} );

	afterEach( () => {
		globalThis.fetch = originalFetch;
	} );

	it( 'reports one event after a successful resolution', async () => {
		const queryClient = makeQueryClient();
		const { result } = renderHook( () => useCanConnectToZendeskMessaging(), {
			wrapper: makeWrapper( queryClient ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( fetchMock ).toHaveBeenCalledTimes( 1 );
		expect( getEventCalls( REQUEST_EVENT ) ).toHaveLength( 1 );
		expect( getEventCalls( ERROR_EVENT ) ).toHaveLength( 0 );
		expect( getEventCalls( REQUEST_EVENT )[ 0 ][ 1 ] ).toEqual( {
			status: 'success',
			status_text: undefined,
			failure_count: 0,
			reporting_version: REPORTING_VERSION,
		} );
	} );

	it( 'reports once for multiple simultaneous consumers', async () => {
		const queryClient = makeQueryClient();
		const wrapper = makeWrapper( queryClient );
		const first = renderHook( () => useCanConnectToZendeskMessaging(), { wrapper } );
		const second = renderHook( () => useCanConnectToZendeskMessaging(), { wrapper } );

		await waitFor( () => {
			expect( first.result.current.isSuccess ).toBe( true );
			expect( second.result.current.isSuccess ).toBe( true );
		} );

		expect( fetchMock ).toHaveBeenCalledTimes( 1 );
		expect( getEventCalls( REQUEST_EVENT ) ).toHaveLength( 1 );
	} );

	it( 'does not report again when mounting against cached data', async () => {
		const queryClient = makeQueryClient();
		const wrapper = makeWrapper( queryClient );
		const first = renderHook( () => useCanConnectToZendeskMessaging(), { wrapper } );

		await waitFor( () => expect( first.result.current.isSuccess ).toBe( true ) );
		first.unmount();

		const second = renderHook( () => useCanConnectToZendeskMessaging(), { wrapper } );
		await waitFor( () => expect( second.result.current.isSuccess ).toBe( true ) );

		expect( fetchMock ).toHaveBeenCalledTimes( 1 );
		expect( getEventCalls( REQUEST_EVENT ) ).toHaveLength( 1 );
	} );

	it( 'reports the error event when a successful response carries falsy data', async () => {
		fetchMock.mockResolvedValue( makeResponse( false ) );
		const queryClient = makeQueryClient();
		const { result } = renderHook( () => useCanConnectToZendeskMessaging(), {
			wrapper: makeWrapper( queryClient ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( getEventCalls( REQUEST_EVENT ) ).toHaveLength( 1 );
		expect( getEventCalls( ERROR_EVENT ) ).toHaveLength( 1 );
		expect( getEventCalls( ERROR_EVENT )[ 0 ][ 1 ] ).toEqual( {
			status: 'success',
			status_text: undefined,
			reporting_version: REPORTING_VERSION,
		} );
	} );

	it( 'reports once after retries reach a final error', async () => {
		fetchMock.mockRejectedValue( new Error( 'Zendesk unavailable' ) );
		const queryClient = makeQueryClient();
		const { result } = renderHook( () => useCanConnectToZendeskMessaging(), {
			wrapper: makeWrapper( queryClient ),
		} );

		await waitFor( () => expect( result.current.isError ).toBe( true ), { timeout: 5000 } );

		expect( fetchMock ).toHaveBeenCalledTimes( 4 );
		expect( getEventCalls( REQUEST_EVENT ) ).toHaveLength( 1 );
		expect( getEventCalls( ERROR_EVENT ) ).toHaveLength( 1 );
		expect( getEventCalls( REQUEST_EVENT )[ 0 ][ 1 ] ).toEqual( {
			status: 'error',
			status_text: 'Zendesk unavailable',
			failure_count: 4,
			reporting_version: REPORTING_VERSION,
		} );
		expect( getEventCalls( ERROR_EVENT )[ 0 ][ 1 ] ).toEqual( {
			status: 'error',
			status_text: 'Zendesk unavailable',
			reporting_version: REPORTING_VERSION,
		} );
	} );

	it( 'keeps the retry count on a resolution that recovered', async () => {
		fetchMock
			.mockRejectedValueOnce( new Error( 'Zendesk unavailable' ) )
			.mockRejectedValueOnce( new Error( 'Zendesk unavailable' ) )
			.mockResolvedValue( makeResponse( true ) );
		const queryClient = makeQueryClient();
		const { result } = renderHook( () => useCanConnectToZendeskMessaging(), {
			wrapper: makeWrapper( queryClient ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ), { timeout: 5000 } );

		expect( fetchMock ).toHaveBeenCalledTimes( 3 );
		expect( getEventCalls( REQUEST_EVENT ) ).toHaveLength( 1 );
		expect( getEventCalls( REQUEST_EVENT )[ 0 ][ 1 ] ).toEqual( {
			status: 'success',
			status_text: undefined,
			failure_count: 2,
			reporting_version: REPORTING_VERSION,
		} );
	} );

	it( 'does not report when disabled', () => {
		const queryClient = makeQueryClient();
		const { result } = renderHook( () => useCanConnectToZendeskMessaging( false ), {
			wrapper: makeWrapper( queryClient ),
		} );

		expect( result.current.status ).toBe( 'pending' );
		expect( fetchMock ).not.toHaveBeenCalled();
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'reports one new event after a genuine refetch', async () => {
		const queryClient = makeQueryClient();
		const { result } = renderHook( () => useCanConnectToZendeskMessaging(), {
			wrapper: makeWrapper( queryClient ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		await act( async () => {
			await result.current.refetch();
		} );

		expect( fetchMock ).toHaveBeenCalledTimes( 2 );
		await waitFor( () => expect( getEventCalls( REQUEST_EVENT ) ).toHaveLength( 2 ) );
	} );

	it( 'keeps the retry count on a refetch that recovered', async () => {
		const queryClient = makeQueryClient();
		const { result } = renderHook( () => useCanConnectToZendeskMessaging(), {
			wrapper: makeWrapper( queryClient ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		fetchMock
			.mockRejectedValueOnce( new Error( 'Zendesk unavailable' ) )
			.mockRejectedValueOnce( new Error( 'Zendesk unavailable' ) )
			.mockResolvedValue( makeResponse( true ) );

		await act( async () => {
			await result.current.refetch();
		} );

		await waitFor( () => expect( getEventCalls( REQUEST_EVENT ) ).toHaveLength( 2 ) );
		expect( getEventCalls( REQUEST_EVENT )[ 1 ][ 1 ] ).toEqual( {
			status: 'success',
			status_text: undefined,
			failure_count: 2,
			reporting_version: REPORTING_VERSION,
		} );
	} );

	it( 'reports again after the query is evicted from the cache', async () => {
		const queryClient = makeQueryClient();
		const wrapper = makeWrapper( queryClient );
		const first = renderHook( () => useCanConnectToZendeskMessaging(), { wrapper } );

		await waitFor( () => expect( first.result.current.isSuccess ).toBe( true ) );
		first.unmount();
		queryClient.removeQueries( { queryKey: [ 'canConnectToZendesk' ] } );

		const second = renderHook( () => useCanConnectToZendeskMessaging(), { wrapper } );
		await waitFor( () => expect( second.result.current.isSuccess ).toBe( true ) );

		expect( fetchMock ).toHaveBeenCalledTimes( 2 );
		expect( getEventCalls( REQUEST_EVENT ) ).toHaveLength( 2 );
	} );

	it( 'reports independently for separate query clients', async () => {
		const first = renderHook( () => useCanConnectToZendeskMessaging(), {
			wrapper: makeWrapper( makeQueryClient() ),
		} );
		const second = renderHook( () => useCanConnectToZendeskMessaging(), {
			wrapper: makeWrapper( makeQueryClient() ),
		} );

		await waitFor( () => {
			expect( first.result.current.isSuccess ).toBe( true );
			expect( second.result.current.isSuccess ).toBe( true );
		} );

		expect( fetchMock ).toHaveBeenCalledTimes( 2 );
		expect( getEventCalls( REQUEST_EVENT ) ).toHaveLength( 2 );
	} );

	it( 'reports once under StrictMode', async () => {
		const queryClient = makeQueryClient();
		const { result } = renderHook( () => useCanConnectToZendeskMessaging(), {
			wrapper: makeWrapper( queryClient, true ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( fetchMock ).toHaveBeenCalledTimes( 1 );
		expect( getEventCalls( REQUEST_EVENT ) ).toHaveLength( 1 );
	} );
} );
