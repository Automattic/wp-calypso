/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { isEditorPage } from '../../utils/is-editor-page';
import useZoomAction from '../use-zoom-action';
import type { UIMessage, UseAgentChatReturn } from '@automattic/agenttic-client';

jest.mock( '../../components/zoom-action-button', () => () => null );
jest.mock( '../../utils/is-editor-page' );

type MessageActionsRegistration = Parameters< UseAgentChatReturn[ 'registerMessageActions' ] >[ 0 ];

function createToolMessage(
	type: string,
	data: Record< string, unknown > = {},
	toolId = 'big_sky__show_component'
): UIMessage {
	return {
		id: 'message-1',
		role: 'agent',
		content: [
			{
				type: 'text',
				text: JSON.stringify( {
					tool_id: toolId,
					data: {
						type,
						...data,
					},
				} ),
			},
		],
	} as UIMessage;
}

function getActions( registration: MessageActionsRegistration | undefined, message: UIMessage ) {
	if ( ! registration ) {
		return [];
	}

	return typeof registration.actions === 'function'
		? registration.actions( message )
		: registration.actions;
}

describe( 'useZoomAction', () => {
	beforeEach( () => {
		( isEditorPage as jest.Mock ).mockReturnValue( true );
	} );

	it.each( [
		'big-sky/show-component',
		'big-sky-show-component',
		'big_sky__show_component',
		'jetpack_ai__show_component',
	] )( 'registers zoom action for %s messages', ( toolId ) => {
		let registration: MessageActionsRegistration | undefined;
		const registerMessageActions = jest.fn( ( nextRegistration ) => {
			registration = nextRegistration;
		} ) as UseAgentChatReturn[ 'registerMessageActions' ];

		renderHook( () => useZoomAction( registerMessageActions ) );

		expect(
			getActions( registration, createToolMessage( 'pattern-picker', {}, toolId ) )
		).toHaveLength( 1 );
	} );

	it.each( [ 'color-picker', 'font-picker' ] )(
		'does not register zoom action for %s messages',
		( type ) => {
			let registration: MessageActionsRegistration | undefined;
			const registerMessageActions = jest.fn( ( nextRegistration ) => {
				registration = nextRegistration;
			} ) as UseAgentChatReturn[ 'registerMessageActions' ];

			renderHook( () => useZoomAction( registerMessageActions ) );

			expect( getActions( registration, createToolMessage( type ) ) ).toEqual( [] );
		}
	);
} );
