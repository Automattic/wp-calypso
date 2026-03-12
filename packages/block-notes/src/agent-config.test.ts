/**
 * Smoke tests for agent-config utilities
 */

import { createAgentConfig } from '@automattic/agents-manager/src/utils/agent-config';
import { getBlogId, createBlockNotesAgentConfig, blockNotesAgentConfig } from './agent-config';

jest.mock( '@automattic/agents-manager/src/utils/agent-config', () => ( {
	createAgentConfig: jest.fn().mockResolvedValue( {} ),
} ) );

jest.mock( './utils/tool-provider', () => ( {
	createToolProvider: jest.fn( () => ( {} ) ),
} ) );

const mockCreateAgentConfig = createAgentConfig as jest.Mock;

describe( 'getBlogId', () => {
	afterEach( () => {
		delete window._currentSiteId;
		delete window.Jetpack_Editor_Initial_State;
	} );

	it( 'returns _currentSiteId when set', () => {
		window._currentSiteId = 123;
		expect( getBlogId() ).toBe( 123 );
	} );

	it( 'falls back to Jetpack_Editor_Initial_State.wpcomBlogId when _currentSiteId is absent', () => {
		window.Jetpack_Editor_Initial_State = { wpcomBlogId: '456' };
		expect( getBlogId() ).toBe( 456 );
	} );

	it( 'returns null when neither source is set', () => {
		expect( getBlogId() ).toBeNull();
	} );
} );

describe( 'createBlockNotesAgentConfig', () => {
	it( 'calls createAgentConfig with sessionId and environment calypso', async () => {
		await createBlockNotesAgentConfig( 'test-session' );

		expect( mockCreateAgentConfig ).toHaveBeenCalledWith(
			expect.objectContaining( {
				sessionId: 'test-session',
				environment: 'calypso',
			} )
		);
	} );
} );

describe( 'blockNotesAgentConfig', () => {
	it( 'createAgentConfig is a function', () => {
		expect( typeof blockNotesAgentConfig.createAgentConfig ).toBe( 'function' );
	} );
} );
