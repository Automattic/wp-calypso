/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
// Packages that Jest can't resolve in this environment
jest.mock( '@automattic/oauth-token', () => ( {} ), { virtual: true } );
jest.mock( '@automattic/agenttic-client', () => ( {} ), { virtual: true } );
jest.mock( 'wpcom-proxy-request', () => ( {} ), { virtual: true } );
jest.mock( '@wordpress/api-fetch', () => ( {} ), { virtual: true } );
jest.mock( '../use-unified-ai-chat', () => ( {
	useUnifiedAiChat: jest.fn(),
} ) );

import { renderHook } from '@testing-library/react';
import { useUnifiedAiChat } from '../use-unified-ai-chat';
import { ORCHESTRATOR_AGENT_ID, UNIFIED_CHAT_AGENT_ID } from '../../constants';
import { useAgentConfig } from '../use-agent-config';

const mockUseUnifiedAiChat = useUnifiedAiChat as jest.Mock;

describe( 'useAgentConfig', () => {
	const mockSearch = ( search: string ) => {
		window.history.pushState( {}, '', search || '/' );
	};

	beforeEach( () => {
		mockSearch( '' );
		mockUseUnifiedAiChat.mockClear();
		mockUseUnifiedAiChat.mockReturnValue( { data: undefined } );
	} );

	afterEach( () => {
		window.history.pushState( {}, '', '/' );
		delete ( globalThis as Record< string, unknown > ).agentsManagerData;
	} );

	it( 'returns `ORCHESTRATOR_AGENT_ID` when `useUnifiedAiChat` returns `undefined`', () => {
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.agentId ).toBe( ORCHESTRATOR_AGENT_ID );
	} );

	it( 'returns `ORCHESTRATOR_AGENT_ID` when `useUnifiedAiChat` returns `false`', () => {
		mockUseUnifiedAiChat.mockReturnValue( { data: false } );
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.agentId ).toBe( ORCHESTRATOR_AGENT_ID );
	} );

	it( 'returns `UNIFIED_CHAT_AGENT_ID` when `useUnifiedAiChat` returns `true`', () => {
		mockUseUnifiedAiChat.mockReturnValue( { data: true } );
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.agentId ).toBe( UNIFIED_CHAT_AGENT_ID );
	} );

	it( 'URL `?agent=` param overrides `useUnifiedAiChat` result', () => {
		mockUseUnifiedAiChat.mockReturnValue( { data: true } );
		mockSearch( '?agent=custom-agent-id' );
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.agentId ).toBe( 'custom-agent-id' );
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

	it( 'returns `isLoading` as `true` when `useUnifiedAiChat` is loading', () => {
		mockUseUnifiedAiChat.mockReturnValue( { data: undefined, isLoading: true } );
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.isLoading ).toBe( true );
	} );

	it( 'returns `isLoading` as `false` when `useUnifiedAiChat` has resolved', () => {
		mockUseUnifiedAiChat.mockReturnValue( { data: false, isLoading: false } );
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.isLoading ).toBe( false );
	} );

	it( 'defaults `agentId` to `ORCHESTRATOR_AGENT_ID` while still loading', () => {
		mockUseUnifiedAiChat.mockReturnValue( { data: undefined, isLoading: true } );
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.agentId ).toBe( ORCHESTRATOR_AGENT_ID );
		expect( result.current.isLoading ).toBe( true );
	} );

	it( 'uses `agentsManagerData.agentId` as default when set', () => {
		( globalThis as Record< string, unknown > ).agentsManagerData = {
			agentId: 'woo-workflow-unified_chat',
		};
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.agentId ).toBe( 'woo-workflow-unified_chat' );
		delete ( globalThis as Record< string, unknown > ).agentsManagerData;
	} );

	it( 'uses a Dolly host override from `agentsManagerData.agentId`', () => {
		( globalThis as Record< string, unknown > ).agentsManagerData = {
			agentId: 'dolly',
		};
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.agentId ).toBe( 'dolly' );
	} );

	it( 'URL `?agent=` param overrides `agentsManagerData.agentId`', () => {
		( globalThis as Record< string, unknown > ).agentsManagerData = {
			agentId: 'woo-workflow-unified_chat',
		};
		mockSearch( '?agent=custom-agent-id' );
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.agentId ).toBe( 'custom-agent-id' );
		delete ( globalThis as Record< string, unknown > ).agentsManagerData;
	} );

	it( '`agentsManagerData.agentId` takes priority over unified experience', () => {
		mockUseUnifiedAiChat.mockReturnValue( { data: true } );
		( globalThis as Record< string, unknown > ).agentsManagerData = {
			agentId: 'woo-workflow-unified_chat',
		};
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.agentId ).toBe( 'woo-workflow-unified_chat' );
	} );

	it( 'uses an explicit host agent ID over URL and unified chat overrides', () => {
		mockUseUnifiedAiChat.mockReturnValue( { data: true, isLoading: true } );
		mockSearch( '?agent=wpcom-workflow-unified_chat' );

		const { result } = renderHook( () => useAgentConfig( 'reader-chat' ) );

		expect( result.current.agentId ).toBe( 'reader-chat' );
		expect( result.current.isLoading ).toBe( false );
		expect( mockUseUnifiedAiChat ).toHaveBeenCalledWith( false );
	} );
} );
