import { createInteractiveUiCatalog, createInteractiveUiRuntime } from '@automattic/ai-ui-renderer';
import { InteractiveUiSurfaces } from '../../components/interactive-ui-surfaces';
import {
	attachInteractiveUiPresentation,
	convertInteractiveUiMessagesToComponents,
} from '../convert-interactive-ui-messages-to-components';
import type { InteractiveUiPresentation } from '../../hooks/use-interactive-ui';
import type { AgentsManagerUIMessage } from '../convert-tool-messages-to-components';
import type { ComponentType } from 'react';

const operations = [
	{
		version: 'v0.9' as const,
		createSurface: {
			surfaceId: 'surface',
			catalogId: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json',
		},
	},
	{
		version: 'v0.9' as const,
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
}: {
	surfaceOwnerId?: string;
	hasLoadError?: boolean;
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
			{ ...surfacesPart, componentProps: { messageId: 'agent', presentation } },
		] );
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
