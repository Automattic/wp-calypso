import { renderHook, waitFor } from '@testing-library/react';
import { useAgentConfig } from './use-agent-config';

let mockSessionId = '';

const mockHasAgent = jest.fn( () => true );
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
			hasAgent: mockHasAgent,
			removeAgent: mockRemoveAgent,
		} ),
	} ),
	{ virtual: true }
);

function createFactory() {
	return {
		createAgentConfig: jest.fn( async ( sessionId: string ) => ( {
			agentId: 'wp-orchestrator',
			agentUrl: 'https://example.com/agent',
			sessionId,
		} ) ),
	};
}

describe( 'useAgentConfig', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockSessionId = '';
	} );

	it( 'builds the config with the session ID of the open image', async () => {
		mockSessionId = 'session-for-image-a';
		const factory = createFactory();

		const { result } = renderHook( () => useAgentConfig( factory ) );

		await waitFor( () => expect( result.current ).not.toBeNull() );
		expect( factory.createAgentConfig ).toHaveBeenCalledWith( 'session-for-image-a' );
		expect( result.current?.sessionId ).toBe( 'session-for-image-a' );
	} );

	it( 'rebuilds the config and drops the previous agent when the session changes', async () => {
		mockSessionId = 'session-for-image-a';
		const factory = createFactory();

		const { result, rerender } = renderHook( () => useAgentConfig( factory ) );
		await waitFor( () => expect( result.current ).not.toBeNull() );

		mockSessionId = 'session-for-image-b';
		rerender();

		await waitFor( () =>
			expect( factory.createAgentConfig ).toHaveBeenCalledWith( 'session-for-image-b' )
		);
		expect( mockRemoveAgent ).toHaveBeenCalledWith( 'wp-orchestrator-session-for-image-a' );
	} );

	it( 'builds nothing until Image Studio opens and mints a session', async () => {
		const factory = createFactory();

		const { result } = renderHook( () => useAgentConfig( factory ) );

		await waitFor( () => expect( factory.createAgentConfig ).not.toHaveBeenCalled() );
		expect( result.current ).toBeNull();
	} );
} );
