/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { DOLLY_AGENT_ID, ORCHESTRATOR_AGENT_ID } from '../../constants';
import { useAgentConfig } from '../use-agent-config';

describe( 'useAgentConfig', () => {
	const mockSearch = ( search: string ) => {
		window.history.pushState( {}, '', search || '/' );
	};

	beforeEach( () => {
		mockSearch( '' );
	} );

	afterEach( () => {
		window.history.pushState( {}, '', '/' );
		delete ( globalThis as Record< string, unknown > ).agentsManagerData;
	} );

	it( 'returns `ORCHESTRATOR_AGENT_ID` by default', () => {
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.agentId ).toBe( ORCHESTRATOR_AGENT_ID );
		expect( result.current.isLoading ).toBe( false );
	} );

	it( 'returns `version` from URL `?version=` param', () => {
		mockSearch( '?version=1.0.25' );
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.version ).toBe( '1.0.25' );
	} );

	it( 'returns `undefined` version when no `?version=` param', () => {
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.version ).toBeUndefined();
	} );

	it( 'uses `agentsManagerData.agentId` as default when set', () => {
		( globalThis as Record< string, unknown > ).agentsManagerData = {
			agentId: 'host-agent',
		};
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.agentId ).toBe( 'host-agent' );
	} );

	it( 'uses a Dolly host override from `agentsManagerData.agentId`', () => {
		( globalThis as Record< string, unknown > ).agentsManagerData = {
			agentId: DOLLY_AGENT_ID,
		};
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.agentId ).toBe( 'dolly' );
	} );

	it( 'URL `?agent=` param overrides `agentsManagerData.agentId`', () => {
		( globalThis as Record< string, unknown > ).agentsManagerData = {
			agentId: 'host-agent',
		};
		mockSearch( '?agent=custom-agent-id' );
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.agentId ).toBe( 'custom-agent-id' );
	} );

	it( 'uses an explicit host agent ID over URL and inline overrides', () => {
		( globalThis as Record< string, unknown > ).agentsManagerData = {
			agentId: 'inline-agent',
		};
		mockSearch( '?agent=url-agent' );

		const { result } = renderHook( () => useAgentConfig( 'reader-chat' ) );

		expect( result.current.agentId ).toBe( 'reader-chat' );
		expect( result.current.isLoading ).toBe( false );
	} );
} );
