import { ORCHESTRATOR_AGENT_ID, UNIFIED_CHAT_AGENT_ID } from '../../constants';
import { getAgentConfig } from '../agent-config';

describe( 'getAgentConfig', () => {
	const originalWindow = global.window;

	const mockLocation = ( search: string ) => {
		global.window = {
			location: { search },
		} as Window & typeof globalThis;
	};

	beforeEach( () => {
		mockLocation( '' );
	} );

	afterEach( () => {
		global.window = originalWindow;
		// Reset the agentsManagerData global
		( global as any ).agentsManagerData = undefined;
	} );

	it( 'returns ORCHESTRATOR_AGENT_ID when agentsManagerData is undefined', () => {
		( global as any ).agentsManagerData = undefined;
		const { agentId } = getAgentConfig();
		expect( agentId ).toBe( ORCHESTRATOR_AGENT_ID );
	} );

	it( 'returns ORCHESTRATOR_AGENT_ID when agentsManagerData.useUnifiedAgent is false', () => {
		( global as any ).agentsManagerData = { useUnifiedAgent: false };
		const { agentId } = getAgentConfig();
		expect( agentId ).toBe( ORCHESTRATOR_AGENT_ID );
	} );

	it( 'returns UNIFIED_CHAT_AGENT_ID when agentsManagerData.useUnifiedAgent is true', () => {
		( global as any ).agentsManagerData = { useUnifiedAgent: true };
		const { agentId } = getAgentConfig();
		expect( agentId ).toBe( UNIFIED_CHAT_AGENT_ID );
	} );

	it( 'URL ?agent= param overrides agentsManagerData.useUnifiedAgent', () => {
		( global as any ).agentsManagerData = { useUnifiedAgent: true };
		mockLocation( '?agent=custom-agent-id' );
		const { agentId } = getAgentConfig();
		expect( agentId ).toBe( 'custom-agent-id' );
	} );

	it( 'URL ?agent= param overrides the default when agentsManagerData is undefined', () => {
		( global as any ).agentsManagerData = undefined;
		mockLocation( '?agent=custom-agent-id' );
		const { agentId } = getAgentConfig();
		expect( agentId ).toBe( 'custom-agent-id' );
	} );

	it( 'returns version from URL ?version= param', () => {
		mockLocation( '?version=1.0.25' );
		const { version } = getAgentConfig();
		expect( version ).toBe( '1.0.25' );
	} );

	it( 'returns undefined version when no ?version= param', () => {
		mockLocation( '' );
		const { version } = getAgentConfig();
		expect( version ).toBeUndefined();
	} );
} );
