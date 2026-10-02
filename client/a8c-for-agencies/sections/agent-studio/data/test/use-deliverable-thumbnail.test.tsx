/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { getAgentStudioRunQueryKey } from '../use-agent-studio-run';
import useDeliverableThumbnail from '../use-deliverable-thumbnail';
import type { AgentStudioOutput } from '../../types';

jest.mock( 'calypso/state', () => ( { useSelector: () => 1 } ) );
const mockGet = jest.fn();
jest.mock( 'calypso/lib/wp', () => ( {
	req: { get: ( ...args: unknown[] ) => mockGet( ...args ) },
} ) );

const output: AgentStudioOutput = {
	id: '10',
	title: 'Deliverable',
	description: '',
	agentName: 'One-pager',
	deliverableType: 'one-pager',
	status: 'generating',
	createdAt: '',
	updatedAt: '',
};

beforeEach( () => {
	mockGet.mockReset();
} );
afterEach( () => jest.useRealTimers() );

function setup( status: AgentStudioOutput[ 'status' ], client = new QueryClient() ) {
	const wrapper = ( { children }: PropsWithChildren ) =>
		createElement( QueryClientProvider, { client }, children );
	return {
		...renderHook( ( state ) => useDeliverableThumbnail( { ...output, status: state } ), {
			initialProps: status,
			wrapper,
		} ),
		client,
	};
}

test.each( [ 'generating', 'failed' ] as const )(
	'does not request or poll run payloads while the deliverable is %s',
	async ( status ) => {
		jest.useFakeTimers();
		mockGet.mockResolvedValue( {
			status: status === 'generating' ? 'a4a_running' : 'a4a_failed',
			payload: {},
		} );
		const { result, unmount, client } = setup( status );
		await act( async () => {
			await jest.advanceTimersByTimeAsync( 4000 );
		} );
		expect( result.current.frames ).toEqual( [] );
		expect( mockGet ).not.toHaveBeenCalled();
		unmount();
		client.clear();
	}
);

test( 'fetches fresh run data when the output becomes ready, replacing a cached old thumbnail', async () => {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( getAgentStudioRunQueryKey( 1, output.id ), {
		status: 'a4a_complete',
		payload: { post_id: 7 },
	} );
	mockGet.mockImplementation( ( { path } ) =>
		Promise.resolve(
			path.endsWith( '/runs/10' )
				? { status: 'a4a_complete', payload: { post_id: 8 } }
				: { variants: [ { html_url: `https://example.com${ path }/html` } ] }
		)
	);
	const { result, rerender } = setup( 'generating', queryClient );
	expect( result.current.frames ).toEqual( [] );
	rerender( 'ready' );
	await waitFor( () => {
		expect( result.current.frames[ 0 ]?.src ).toBe(
			'https://example.com/agency/1/a4a/collateral/8/html?layout=filmstrip&pages=4'
		);
	} );
	expect( result.current.isLoading ).toBe( false );
	expect( mockGet ).toHaveBeenCalledWith( {
		apiNamespace: 'wpcom/v2',
		path: '/agency/1/a4a/runs/10',
	} );
} );
