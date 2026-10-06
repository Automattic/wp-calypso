/**
 * @jest-environment jsdom
 */
import { HelpCenter } from '@automattic/data-stores';
import { render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { OdieSendMessageButton } from '..';
import { useOdieAssistantContext } from '../../../context';
import { useSendChatMessage } from '../../../hooks';
import type { Chat, Message } from '../../../types';

jest.mock( '@automattic/agenttic-ui/index.css', () => ( {} ), { virtual: true } );
jest.mock(
	'@automattic/agenttic-ui',
	() => ( { useInput: () => ( { textareaRef: { current: null } } ) } ),
	{ virtual: true }
);
jest.mock( '@automattic/zendesk-client', () => ( {
	isTestModeEnvironment: () => false,
	useConnectionStatusNotice: () => undefined,
} ) );
jest.mock( 'smooch', () => ( {
	__esModule: true,
	default: { startTyping: jest.fn(), stopTyping: jest.fn() },
} ) );
jest.mock( '../../../context', () => ( { useOdieAssistantContext: jest.fn() } ) );
jest.mock( '../../../hooks', () => ( { useSendChatMessage: jest.fn() } ) );
jest.mock( '../../chat-footer', () => ( {
	AgentUIFooter: ( { value }: { value: string } ) => (
		<textarea aria-label="Chat input" value={ value } readOnly />
	),
} ) );
jest.mock( '../../email-fallback-notice', () => ( { EmailFallbackNotice: () => null } ) );
jest.mock( '../use-attachment-handler', () => ( {
	useAttachmentHandler: () => ( {
		attachmentPreviews: null,
		sendAttachments: jest.fn(),
		handleImagePaste: jest.fn(),
		attachmentAction: {},
		isAttachingFile: false,
		showAttachmentButton: false,
		AttachmentDropZone: () => null,
		badFormatNotice: undefined,
	} ),
} ) );

HelpCenter.register();

const QUERY = 'How do I add a domain?';
const sendMessage = jest.fn().mockResolvedValue( undefined );

function makeChat( overrides: Partial< Chat > = {} ): Chat {
	return {
		odieId: null,
		conversationId: null,
		messages: [] as Message[],
		provider: 'odie',
		status: 'loaded',
		...overrides,
	} as Chat;
}

function mockChat( chat: Chat ) {
	jest.mocked( useOdieAssistantContext ).mockReturnValue( {
		trackEvent: jest.fn(),
		chat,
		canConnectToZendesk: true,
		forceEmailSupport: false,
		isChatRestricted: false,
	} as unknown as ReturnType< typeof useOdieAssistantContext > );
}

function renderInput( route: string, { strict = false } = {} ) {
	const tree = (
		<MemoryRouter initialEntries={ [ route ] }>
			<OdieSendMessageButton />
		</MemoryRouter>
	);
	return render( strict ? <StrictMode>{ tree }</StrictMode> : tree );
}

const route = ( params: Record< string, string > ) =>
	`/odie?${ new URLSearchParams( params ).toString() }`;

describe( 'OdieSendMessageButton initial query', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( useSendChatMessage ).mockReturnValue( { sendMessage, abort: jest.fn() } );
	} );

	it( 'sends the query of a new chat once', () => {
		mockChat( makeChat() );
		renderInput( route( { query: QUERY } ) );

		expect( sendMessage ).toHaveBeenCalledTimes( 1 );
		expect( sendMessage ).toHaveBeenCalledWith(
			expect.objectContaining( { content: QUERY, role: 'user' } )
		);
	} );

	it( 'sends the query only once when the effects run twice', () => {
		mockChat( makeChat() );
		renderInput( route( { query: QUERY } ), { strict: true } );

		expect( sendMessage ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'waits for the chat to load before sending the query', () => {
		mockChat( makeChat( { status: 'loading' } ) );
		const { rerender } = renderInput( route( { query: QUERY } ) );

		expect( sendMessage ).not.toHaveBeenCalled();

		mockChat( makeChat() );
		rerender(
			<MemoryRouter initialEntries={ [ route( { query: QUERY } ) ] }>
				<OdieSendMessageButton />
			</MemoryRouter>
		);

		expect( sendMessage ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not reuse the query in a chat that already has an interaction', () => {
		// An escalated chat keeps the query in its persisted route, and while it loads it can briefly
		// look empty. Sending the query then posted it to the Zendesk conversation again.
		mockChat( makeChat( { provider: 'zendesk', conversationId: 'conversation-1' } ) );
		renderInput( route( { query: QUERY, id: 'interaction-1' } ) );

		expect( sendMessage ).not.toHaveBeenCalled();
		expect( screen.getByRole( 'textbox', { name: 'Chat input' } ) ).toHaveValue( '' );
	} );

	it( 'does not reuse the query in a logged-out chat', () => {
		mockChat( makeChat() );
		renderInput( route( { query: QUERY, chatId: '123' } ) );

		expect( sendMessage ).not.toHaveBeenCalled();
		expect( screen.getByRole( 'textbox', { name: 'Chat input' } ) ).toHaveValue( '' );
	} );
} );
