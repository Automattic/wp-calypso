import { act, renderHook, waitFor } from '@testing-library/react';
import { useAgentConfig } from './use-agent-config';

let mockSessionId = '';

// Mirrors the agent manager's contract: agents are keyed by agent ID alone.
const mockCreatedAgents = new Set< string >();
const mockReplaceMessages = jest.fn();
const mockRemoveAgent = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn( ( callback ) =>
		callback( () => ( {
			getSessionId: () => mockSessionId,
		} ) )
	),
} ) );

jest.mock( '../store', () => ( {
	store: 'image-studio',
} ) );

// The package is ESM-only, so Jest's CJS resolver cannot load the real module.
jest.mock(
	'@automattic/agenttic-client',
	() => ( {
		getAgentManager: () => ( {
			hasAgent: ( key: string ) => mockCreatedAgents.has( key ),
			removeAgent: mockRemoveAgent,
			replaceMessages: mockReplaceMessages,
		} ),
	} ),
	{ virtual: true }
);

const mockCreateAgentConfig = jest.fn( async ( sessionId: string ) => ( {
	agentId: 'wp-orchestrator',
	agentUrl: 'https://example.com/agent',
	sessionId,
} ) );

// A fresh object each call, so tests can vary the factory identity while
// still counting builds through one mock.
function createFactory() {
	return { createAgentConfig: mockCreateAgentConfig };
}

describe( 'useAgentConfig', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockCreatedAgents.clear();
		mockSessionId = '';
	} );

	it( 'builds the config with the session ID of the open image', async () => {
		mockSessionId = 'session-build-a';
		const factory = createFactory();

		const { result } = renderHook( () => useAgentConfig( factory ) );

		await waitFor( () => expect( result.current ).not.toBeNull() );
		expect( mockCreateAgentConfig ).toHaveBeenCalledWith( 'session-build-a' );
		expect( result.current?.sessionId ).toBe( 'session-build-a' );
	} );

	it( 'drops the previous config while the new session loads', async () => {
		mockSessionId = 'session-drop-a';
		const factory = createFactory();

		const { result, rerender } = renderHook( () => useAgentConfig( factory ) );
		await waitFor( () => expect( result.current ).not.toBeNull() );

		mockSessionId = 'session-drop-b';
		rerender();

		// Holding the old config would let a prompt for the new image land in
		// the previous image's conversation.
		expect( result.current ).toBeNull();
		await waitFor( () => expect( result.current?.sessionId ).toBe( 'session-drop-b' ) );
	} );

	it( 'holds no config when the next session fails to load', async () => {
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		mockSessionId = 'session-error-a';

		const { result, rerender } = renderHook( () => useAgentConfig( createFactory() ) );
		await waitFor( () => expect( result.current ).not.toBeNull() );

		mockCreateAgentConfig.mockRejectedValueOnce( new Error( 'no token' ) );
		mockSessionId = 'session-error-b';
		rerender();

		// Keeping the old config would leave the chat pointing at the previous
		// image's conversation with no sign anything went wrong.
		await waitFor( () => expect( consoleError ).toHaveBeenCalled() );
		expect( result.current ).toBeNull();
		consoleError.mockRestore();
	} );

	it( 'clears the shared conversation when the session changes', async () => {
		mockSessionId = 'session-clear-a';
		const factory = createFactory();

		const { result, rerender } = renderHook( () => useAgentConfig( factory ) );
		await waitFor( () => expect( result.current ).not.toBeNull() );
		// The chat creates the agent under the agent ID once the config exists.
		mockCreatedAgents.add( 'wp-orchestrator' );

		mockSessionId = 'session-clear-b';
		rerender();

		await waitFor( () =>
			expect( mockReplaceMessages ).toHaveBeenCalledWith( 'wp-orchestrator', [] )
		);
	} );

	it( 'leaves the agent in place, since other consumers share it', async () => {
		mockSessionId = 'session-keep-a';
		const factory = createFactory();

		const { result, rerender, unmount } = renderHook( () => useAgentConfig( factory ) );
		await waitFor( () => expect( result.current ).not.toBeNull() );
		mockCreatedAgents.add( 'wp-orchestrator' );

		mockSessionId = 'session-keep-b';
		rerender();
		await waitFor( () => expect( mockReplaceMessages ).toHaveBeenCalled() );
		unmount();

		expect( mockRemoveAgent ).not.toHaveBeenCalled();
		expect( mockCreatedAgents.has( 'wp-orchestrator' ) ).toBe( true );
	} );

	it( 'clears once per session however many consumers are mounted', async () => {
		mockSessionId = 'session-once-a';
		mockCreatedAgents.add( 'wp-orchestrator' );

		const first = renderHook( () => useAgentConfig( createFactory() ) );
		const second = renderHook( () => useAgentConfig( createFactory() ) );

		await waitFor( () => expect( first.result.current ).not.toBeNull() );
		await waitFor( () => expect( second.result.current ).not.toBeNull() );

		expect( mockReplaceMessages ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not rebuild when only the factory identity changes', async () => {
		mockSessionId = 'session-factory-a';

		const { result, rerender } = renderHook( ( { factory } ) => useAgentConfig( factory ), {
			initialProps: { factory: createFactory() },
		} );
		await waitFor( () => expect( result.current ).not.toBeNull() );

		rerender( { factory: createFactory() } );
		await act( async () => {} );

		// A rebuild would tear down the conversation the user is in the middle of.
		expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'builds nothing until Image Studio opens and mints a session', async () => {
		const factory = createFactory();

		const { result } = renderHook( () => useAgentConfig( factory ) );

		await waitFor( () => expect( mockCreateAgentConfig ).not.toHaveBeenCalled() );
		expect( result.current ).toBeNull();
	} );
} );
