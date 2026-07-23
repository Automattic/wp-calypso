/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { handleSupportInteractionsFetch } from '../handle-support-interactions-fetch';
import { useManageSupportInteraction } from '../use-manage-support-interaction';
import type { SupportInteraction } from '../../types';

jest.mock( '@automattic/zendesk-client', () => ( {
	isTestModeEnvironment: () => false,
} ) );

jest.mock( '../../context', () => ( {
	useOdieAssistantContext: () => ( { newInteractionsBotSlug: 'wpcom-support-chat' } ),
} ) );

jest.mock( '../handle-support-interactions-fetch', () => ( {
	handleSupportInteractionsFetch: jest.fn(),
} ) );

const mockFetch = handleSupportInteractionsFetch as jest.MockedFunction<
	typeof handleSupportInteractionsFetch
>;

const interaction = {
	uuid: 'int-1',
	bot_slug: 'wpcom-support-chat',
	events: [ { event_source: 'odie', event_external_id: '42' } ],
} as unknown as SupportInteraction;

function setup() {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	} );
	queryClient.setQueryData( [ 'support-interactions', 'get-interactions', false ], [] );
	const invalidateSpy = jest.spyOn( queryClient, 'invalidateQueries' );
	const wrapper = ( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);
	const { result } = renderHook( () => useManageSupportInteraction(), { wrapper } );
	return { result, invalidateSpy };
}

const invalidatedOdie = ( spy: jest.SpyInstance ) =>
	spy.mock.calls.some(
		( [ arg ] ) => Array.isArray( arg?.queryKey ) && arg.queryKey[ 0 ] === 'odie-interactions'
	);

describe( 'useManageSupportInteraction', () => {
	beforeEach( () => {
		mockFetch.mockReset();
		mockFetch.mockResolvedValue( interaction as never );
	} );

	it( 'invalidates odie-interactions after starting a new interaction', async () => {
		const { result, invalidateSpy } = setup();

		await result.current.startNewInteraction( {
			event_external_id: '42',
			event_source: 'odie',
		} );

		expect( invalidatedOdie( invalidateSpy ) ).toBe( true );
	} );

	it( 'invalidates odie-interactions after adding an event to an interaction', async () => {
		const { result, invalidateSpy } = setup();

		await result.current.addEventToInteraction( {
			interactionId: 'int-1',
			eventData: { event_external_id: '42', event_source: 'odie' },
		} );

		expect( invalidatedOdie( invalidateSpy ) ).toBe( true );
	} );
} );
