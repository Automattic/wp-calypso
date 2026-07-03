/**
 * @jest-environment jsdom
 */
import { getAgentsManagerInlineData } from '../get-agents-manager-inline-data';

type WithBareGlobal = typeof globalThis & { agentsManagerData?: unknown };

function setBareGlobal( value: unknown ): void {
	( globalThis as WithBareGlobal ).agentsManagerData = value;
}

function clearBareGlobal(): void {
	delete ( globalThis as WithBareGlobal ).agentsManagerData;
}

function setWindowInlineData( value: unknown ): void {
	( window as typeof window & { agentsManagerData?: unknown } ).agentsManagerData = value;
}

function clearWindowInlineData(): void {
	delete ( window as typeof window & { agentsManagerData?: unknown } ).agentsManagerData;
}

describe( 'getAgentsManagerInlineData', () => {
	afterEach( () => {
		clearBareGlobal();
		clearWindowInlineData();
	} );

	it( 'returns the bare global when Jetpack injects `agentsManagerData`', () => {
		setBareGlobal( { agentId: 'orchestrator', useUnifiedExperience: true } );
		expect( getAgentsManagerInlineData() ).toEqual( {
			agentId: 'orchestrator',
			useUnifiedExperience: true,
		} );
	} );

	it( 'falls back to `window.agentsManagerData` when no bare global exists', () => {
		setWindowInlineData( { agentId: 'reader-chat' } );
		expect( getAgentsManagerInlineData() ).toEqual( { agentId: 'reader-chat' } );
	} );

	it( 'prefers the bare global over `window.agentsManagerData`', () => {
		setWindowInlineData( { agentId: 'reader-chat' } );
		setBareGlobal( { agentId: 'orchestrator' } );
		expect( getAgentsManagerInlineData() ).toEqual( { agentId: 'orchestrator' } );
	} );

	it( 'returns `undefined` when inline data is missing', () => {
		expect( getAgentsManagerInlineData() ).toBeUndefined();
	} );
} );
