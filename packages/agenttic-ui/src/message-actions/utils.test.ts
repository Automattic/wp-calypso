import { describe, expect, it, vi } from 'vitest';
import { createFeedbackActions } from './utils';
import type { Message, MessageActionButton } from '../types';

const message: Message = {
	id: 'agent-1',
	role: 'agent',
	content: [ { type: 'text', text: 'Answer' } ],
	timestamp: 1,
	archived: false,
	showIcon: true,
};

const icons = { up: 'up', down: 'down' };

describe( 'createFeedbackActions', () => {
	it( 'returns an always-visible thumbs pair by default', () => {
		const manager = createFeedbackActions( { onFeedback: vi.fn(), icons } );

		const actions = manager.getActionsForMessage( message ) as MessageActionButton[];

		expect( actions.map( ( action ) => action.id ) ).toEqual( [ 'feedback-up', 'feedback-down' ] );
		expect( actions.every( ( action ) => ! action.revealOnHover ) ).toBe( true );
	} );

	it( 'returns nothing when the condition rejects the message', () => {
		const manager = createFeedbackActions( { onFeedback: vi.fn(), condition: () => false, icons } );

		expect( manager.getActionsForMessage( message ) ).toEqual( [] );
	} );
} );
