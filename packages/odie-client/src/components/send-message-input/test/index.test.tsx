/**
 * @jest-environment jsdom
 */
import { HelpCenter } from '@automattic/data-stores';
import { render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { OdieSendMessageButton } from '..';
import { useOdieAssistantContext } from '../../../context';
import { useSendChatMessage } from '../../../hooks';
import type { Chat, Message } from '../../../types';

vi.mock( '@automattic/agenttic-ui/index.css', () => ( {} ) );
vi.mock(
	'@automattic/agenttic-ui',
	() => ( { useInput: () => ( { textareaRef: { current: null } } ) } )
);
vi.mock( '@automattic/zendesk-client', () => ( {
	isTestModeEnvironment: () => false,
	useConnectionStatusNotice: () => undefined,
} ) );
vi.mock( 'smooch', () => ( {
	__esModule: true,
	default: { startTyping: vi.fn(), stopTyping: vi.fn() },
} ) );
vi.mock( '../../../context', () => ( { useOdieAssistantContext: vi.fn() } ) );
vi.mock( '../../../hooks', () => ( { useSendChatMessage: vi.fn() } ) );
vi.mock( '../../chat-footer', () => ( {
	AgentUIFooter: ( { value }: { value: string } ) => (
		<textarea aria-label="Chat input" value={ value } readOnly />
	),
} ) );
vi.mock( '../../email-fallback-notice', () => ( { EmailFallbackNotice: () => null } ) );
vi.mock( '../use-attachment-handler', () => ( {
	useAttachmentHandler: () => ( {
		attachmentPreviews: null,
		sendAttachments: vi.fn(),
		handleImagePaste: vi.fn(),
		attachmentAction: {},
		isAttachingFile: false,
		showAttachmentButton: false,
		AttachmentDropZone: () => null,
		badFormatNotice: undefined,
	} ),
} ) );

HelpCenter.register();

const QUERY = 'How do I add a domain?';
const sendMessage = vi.fn().mockResolvedValue( undefined );

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

function mockChat( chat: Chat, { isUserEligibleForPaidSupport = false } = {} ) {
	vi.mocked( useOdieAssistantContext ).mockReturnValue( {
		trackEvent: vi.fn(),
		chat,
		canConnectToZendesk: true,
		forceEmailSupport: false,
		isChatRestricted: false,
		isUserEligibleForPaidSupport,
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
		vi.clearAllMocks();
		vi.mocked( useSendChatMessage ).mockReturnValue( { sendMessage, abort: vi.fn() } );
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

describe( 'OdieSendMessageButton while a chat with a human starts', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		vi.mocked( useSendChatMessage ).mockReturnValue( { sendMessage, abort: vi.fn() } );
	} );

	it( 'holds the message while going straight to a human', () => {
		mockChat( makeChat(), { isUserEligibleForPaidSupport: true } );
		renderInput( route( { provider: 'zendesk', query: QUERY } ) );

		expect( sendMessage ).not.toHaveBeenCalled();
		expect( screen.getByRole( 'textbox', { name: 'Chat input' } ) ).toHaveValue( QUERY );
	} );

	it( 'holds the message while the chat is handed to a human', () => {
		mockChat( makeChat( { status: 'transfer' } ) );
		renderInput( route( { query: QUERY } ) );

		expect( sendMessage ).not.toHaveBeenCalled();
	} );

	it( 'sends the message to the AI when the user can’t go straight to a human', () => {
		mockChat( makeChat() );
		renderInput( route( { provider: 'zendesk', query: QUERY } ) );

		expect( sendMessage ).toHaveBeenCalledTimes( 1 );
	} );
} );
