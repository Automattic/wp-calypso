import { createInteractiveUiCatalog, createInteractiveUiRuntime } from '@automattic/ai-ui-renderer';
import {
	attachInteractiveUiPresentation,
	convertInteractiveUiMessagesToComponents,
	markInteractiveUiActionReplies,
} from '../convert-messages-to-components';
import { InteractiveUiSurfaces } from '../surfaces';
import type { AgentsManagerUIMessage } from '../../utils/convert-tool-messages-to-components';
import type { InteractiveUiPresentation } from '../use-interactive-ui';
import type { ComponentType } from 'react';

const operations = [
	{
		version: 'v1.0' as const,
		createSurface: {
			surfaceId: 'surface',
			catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
		},
	},
	{
		version: 'v1.0' as const,
		updateComponents: {
			surfaceId: 'surface',
			components: [ { id: 'root', component: 'Text', text: 'Surface' } ],
		},
	},
];

const envelope = JSON.stringify( { tool_id: 'wpcom__render_interactive_ui', data: operations } );

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
}: {
	surfaceOwnerId?: string;
	hasLoadError?: boolean;
	staleSurfaceIds?: string[];
} ): InteractiveUiPresentation {
	const runtime = createInteractiveUiRuntime( {
		catalogs: [ createInteractiveUiCatalog() ],
		onAction: jest.fn(),
		onError: jest.fn(),
	} );

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
		isDisabled: false,
		staleSurfaceIds: new Set( staleSurfaceIds ),
	};
}

describe( 'convertInteractiveUiMessagesToComponents', () => {
	it( 'replaces an agent message’s interactive UI parts with one surfaces part', () => {
		const message = createMessage( 'agent', 'agent', [
			{ type: 'text', text: 'Here you go.' },
			{ type: 'text', text: envelope },
			{ type: 'text', text: envelope },
		] );

		const [ converted ] = convertInteractiveUiMessagesToComponents( [ message ] );

		expect( converted.content ).toEqual( [ { type: 'text', text: 'Here you go.' }, surfacesPart ] );
	} );

	it( 'leaves user messages unchanged', () => {
		const message = createMessage( 'user', 'user', [ { type: 'text', text: envelope } ] );

		expect( convertInteractiveUiMessagesToComponents( [ message ] )[ 0 ] ).toBe( message );
	} );
} );

describe( 'attachInteractiveUiPresentation', () => {
	const message = createMessage( 'agent', 'agent', [ surfacesPart ] );

	it.each( [
		[ 'its message has surfaces', { surfaceOwnerId: 'agent' } ],
		[ 'the renderer failed to load', { hasLoadError: true } ],
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
			staleSurfaceIds: [ 'surface' ],
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

describe( 'markInteractiveUiActionReplies', () => {
	const reply = createMessage( 'reply', 'agent', [ { type: 'text', text: 'Hello, Ada!' } ] );

	it( 'starts a turn at the shown reply to an action', () => {
		const action = createMessage( 'action', 'user', [
			{ type: 'context', text: JSON.stringify( { version: 'v1.0', action: { name: 'greet' } } ) },
		] );
		const toolCall = createMessage( 'tool-call', 'agent', [ { type: 'text', text: '{}' } ] );
		const dataOnly = createMessage( 'data-only', 'agent', [ { type: 'data', data: {} } ] );

		const [ , marked ] = markInteractiveUiActionReplies(
			[ dataOnly, reply ],
			[ action, toolCall, dataOnly, reply ]
		);

		expect( marked.startsTurn ).toBe( true );
	} );

	it( 'leaves a reply to other hidden context in its turn', () => {
		const navigation = createMessage( 'navigation', 'user', [
			{ type: 'context', text: 'Navigated to the About page.' },
		] );

		const [ marked ] = markInteractiveUiActionReplies( [ reply ], [ navigation, reply ] );

		expect( marked ).toBe( reply );
	} );
} );
