import { InteractiveUiActionNote } from '../action-note';
import {
	attachInteractiveUiPresentation,
	convertInteractiveUiMessagesToComponents,
	presentInteractiveUiActions,
} from '../convert-messages-to-components';
import { InteractiveUiSurfaces } from '../surfaces';
import { createRuntime, operations, surfaceContent } from './fixtures/surface';
import type { AgentsManagerUIMessage } from '../../utils/convert-tool-messages-to-components';
import type { InteractiveUiPresentation } from '../use-interactive-ui';
import type { ComponentType } from 'react';

function createMessage(
	id: string,
	role: AgentsManagerUIMessage[ 'role' ],
	content: AgentsManagerUIMessage[ 'content' ]
): AgentsManagerUIMessage {
	return { id, role, content, timestamp: 0, archived: false, showIcon: false };
}

const surfacesPart = {
	type: 'component' as const,
	component: InteractiveUiSurfaces as ComponentType,
	componentProps: { messageId: 'agent' },
};

function createPresentation( {
	surfaceOwnerId,
	hasLoadError = false,
	staleSurfaceIds = [],
	rejectedMessageIds = [],
}: {
	surfaceOwnerId?: string;
	hasLoadError?: boolean;
	staleSurfaceIds?: string[];
	rejectedMessageIds?: string[];
} ): InteractiveUiPresentation {
	const runtime = createRuntime();

	if ( surfaceOwnerId ) {
		runtime.processMessages( operations, surfaceOwnerId );
	}

	return {
		runtime,
		renderer: undefined,
		hasLoadError,
		isRetryingLoad: false,
		retryLoad: jest.fn(),
		revision: 0,
		isBusy: false,
		staleSurfaceIds: new Set( staleSurfaceIds ),
		rejectedMessageIds: new Set( rejectedMessageIds ),
		restoredMessageIds: new Set(),
	};
}

describe( 'convertInteractiveUiMessagesToComponents', () => {
	it( 'replaces an agent message’s interactive UI parts with one surfaces part', () => {
		const message = createMessage( 'agent', 'agent', [
			{ type: 'text', text: 'Here you go.' },
			surfaceContent,
			surfaceContent,
		] );

		const [ converted ] = convertInteractiveUiMessagesToComponents( [ message ] );

		expect( converted.content ).toEqual( [ { type: 'text', text: 'Here you go.' }, surfacesPart ] );
	} );

	it( 'leaves user messages unchanged', () => {
		const message = createMessage( 'user', 'user', [ surfaceContent ] );

		expect( convertInteractiveUiMessagesToComponents( [ message ] )[ 0 ] ).toBe( message );
	} );
} );

describe( 'attachInteractiveUiPresentation', () => {
	const message = createMessage( 'agent', 'agent', [ surfacesPart ] );

	it.each( [
		[ 'its message has surfaces', { surfaceOwnerId: 'agent' } ],
		[ 'the renderer failed to load', { hasLoadError: true } ],
		[ 'the runtime rejected some of its A2UI messages', { rejectedMessageIds: [ 'agent' ] } ],
	] )( 'hands the surfaces part the presentation when %s', ( _description, options ) => {
		const presentation = createPresentation( options );

		const [ attached ] = attachInteractiveUiPresentation( [ message ], presentation );

		expect( attached.content ).toEqual( [
			{
				...surfacesPart,
				componentProps: { messageId: 'agent', presentation },
			},
		] );
	} );

	it( 'disables the actions of a message whose surfaces are all stale', () => {
		const presentation = createPresentation( {
			surfaceOwnerId: 'agent',
			staleSurfaceIds: [ 'test-surface' ],
		} );
		const feedback = { id: 'feedback-up', label: 'Good response', onClick: jest.fn() };

		const [ attached ] = attachInteractiveUiPresentation(
			[ { ...message, actions: [ feedback ] } ],
			presentation
		);

		expect( attached.actions ).toEqual( [ { ...feedback, disabled: true } ] );
		expect( attached ).not.toHaveProperty( 'disabled' );
	} );

	it( 'drops the surfaces part while its message has no surface yet', () => {
		const presentation = createPresentation( { surfaceOwnerId: 'another-message' } );

		const [ attached ] = attachInteractiveUiPresentation( [ message ], presentation );

		expect( attached.content ).toEqual( [] );
	} );

	it( 'returns messages without a surfaces part unchanged', () => {
		const textMessage = createMessage( 'text', 'agent', [ { type: 'text', text: 'Hi' } ] );

		const [ attached ] = attachInteractiveUiPresentation(
			[ textMessage ],
			createPresentation( {} )
		);

		expect( attached ).toBe( textMessage );
	} );
} );

describe( 'presentInteractiveUiActions', () => {
	const reply = createMessage( 'reply', 'agent', [ { type: 'text', text: 'Hello, Ada!' } ] );
	const toolCall = createMessage( 'tool-call', 'agent', [ { type: 'text', text: '{}' } ] );
	const dataOnly = createMessage( 'data-only', 'agent', [ { type: 'data', data: {} } ] );

	function createActionMessage( action: Record< string, unknown > ) {
		return createMessage( 'action', 'user', [
			{ type: 'context', text: JSON.stringify( { version: 'v1.0', action } ) },
		] );
	}

	it( 'starts a turn at the shown reply to an action without a `userMessage`', () => {
		const action = createActionMessage( { name: 'greet' } );

		const presented = presentInteractiveUiActions(
			[ dataOnly, reply ],
			[ action, toolCall, dataOnly, reply ]
		);

		expect( presented ).toEqual( [ dataOnly, { ...reply, startsTurn: true } ] );
	} );

	it( 'leaves a reply to other hidden context in its turn', () => {
		const navigation = createMessage( 'navigation', 'user', [
			{ type: 'context', text: 'Navigated to the About page.' },
		] );

		const [ marked ] = presentInteractiveUiActions( [ reply ], [ navigation, reply ] );

		expect( marked ).toBe( reply );
	} );

	it( 'shows an action’s `userMessage` as a note on the user’s side before its reply', () => {
		const action = createActionMessage( { name: 'save', userMessage: 'Save the title' } );

		const [ note, shownDataOnly, shownReply ] = presentInteractiveUiActions(
			[ dataOnly, reply ],
			[ action, toolCall, dataOnly, reply ]
		);

		expect( shownDataOnly ).toBe( dataOnly );
		expect( note ).toMatchObject( {
			id: 'action-note',
			role: 'user',
			content: [
				{
					type: 'component',
					component: InteractiveUiActionNote,
					componentProps: { userMessage: 'Save the title' },
				},
			],
		} );
		expect( shownReply ).toBe( reply );
	} );

	it( 'shows an action’s note before a reply that’s still hidden, so the reply stays last', () => {
		const action = createActionMessage( { name: 'save', userMessage: 'Save the title' } );
		const hiddenReply = createMessage( 'hidden-reply', 'agent', [] );

		const presented = presentInteractiveUiActions( [ hiddenReply ], [ action, hiddenReply ] );

		expect( presented ).toEqual( [
			expect.objectContaining( { id: 'action-note', role: 'user' } ),
			hiddenReply,
		] );
	} );

	it( 'shows an action’s note last until its reply arrives', () => {
		const action = createActionMessage( { name: 'save', userMessage: 'Save the title' } );

		const presented = presentInteractiveUiActions( [ reply ], [ reply, action ] );

		expect( presented ).toEqual( [
			reply,
			expect.objectContaining( { id: 'action-note', role: 'user' } ),
		] );
	} );
} );
