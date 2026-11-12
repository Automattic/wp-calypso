/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
vi.mock( '@automattic/agenttic-client', () => ( {
	createOdieBotId: vi.fn( ( agentId: string ) => `wpcom-agent-${ agentId.replace( /-/g, '_' ) }` ),
	isOdieBotId: vi.fn( ( agentId: string ) => agentId.startsWith( 'wpcom-' ) ),
} ) );

import { createOdieBotId } from '@automattic/agenttic-client';
import { type Mock, vi } from 'vitest';
import { getConversationBotId } from '../conversation-bot-id';

const mockCreateOdieBotId = createOdieBotId as Mock;

describe( 'getConversationBotId', () => {
	beforeEach( () => {
		mockCreateOdieBotId.mockClear();
	} );

	it( 'keeps reader-chat agent IDs unchanged', () => {
		expect( getConversationBotId( 'reader-chat', false ) ).toBe( 'reader-chat' );
		expect( getConversationBotId( 'p2-reader-chat', false ) ).toBe( 'p2-reader-chat' );
		expect( mockCreateOdieBotId ).not.toHaveBeenCalled();
	} );

	it( 'keeps explicit agent URL overrides unchanged', () => {
		expect( getConversationBotId( 'custom-agent', true ) ).toBe( 'custom-agent' );
		expect( mockCreateOdieBotId ).not.toHaveBeenCalled();
	} );

	it( 'keeps existing Odie bot IDs unchanged', () => {
		expect( getConversationBotId( 'wpcom-agent-wp_orchestrator', false ) ).toBe(
			'wpcom-agent-wp_orchestrator'
		);
		expect( mockCreateOdieBotId ).not.toHaveBeenCalled();
	} );

	it( 'converts regular agent IDs to Odie bot IDs', () => {
		expect( getConversationBotId( 'wp-orchestrator', false ) ).toBe(
			'wpcom-agent-wp_orchestrator'
		);
		expect( mockCreateOdieBotId ).toHaveBeenCalledWith( 'wp-orchestrator' );
	} );
} );
