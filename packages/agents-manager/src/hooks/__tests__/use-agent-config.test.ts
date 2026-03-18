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
		mockUseUnifiedAiChat.mockReturnValue( { data: undefined } );
	} );

	afterEach( () => {
		window.history.pushState( {}, '', '/' );
	} );

	it( 'returns ORCHESTRATOR_AGENT_ID when useUnifiedAiChat returns undefined', () => {
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.agentId ).toBe( ORCHESTRATOR_AGENT_ID );
	} );

	it( 'returns ORCHESTRATOR_AGENT_ID when useUnifiedAiChat returns false', () => {
		mockUseUnifiedAiChat.mockReturnValue( { data: false } );
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.agentId ).toBe( ORCHESTRATOR_AGENT_ID );
	} );

	it( 'returns UNIFIED_CHAT_AGENT_ID when useUnifiedAiChat returns true', () => {
		mockUseUnifiedAiChat.mockReturnValue( { data: true } );
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.agentId ).toBe( UNIFIED_CHAT_AGENT_ID );
	} );

	it( 'URL ?agent= param overrides useUnifiedAiChat result', () => {
		mockUseUnifiedAiChat.mockReturnValue( { data: true } );
		mockSearch( '?agent=custom-agent-id' );
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.agentId ).toBe( 'custom-agent-id' );
	} );

	it( 'returns version from URL ?version= param', () => {
		mockSearch( '?version=1.0.25' );
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.version ).toBe( '1.0.25' );
	} );

	it( 'returns undefined version when no ?version= param', () => {
		const { result } = renderHook( () => useAgentConfig() );
		expect( result.current.version ).toBeUndefined();
	} );
} );
