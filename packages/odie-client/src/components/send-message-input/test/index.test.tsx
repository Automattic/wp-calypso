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
// Changed by each test.
let mockTextarea: HTMLTextAreaElement | null = null;
let mockHasEnTranslation = true;

jest.mock(
	'@automattic/agenttic-ui',
	() => ( { useInput: () => ( { textareaRef: { current: mockTextarea } } ) } ),
	{ virtual: true }
);
jest.mock( '@automattic/i18n-utils', () => ( {
	useHasEnTranslation: () => () => mockHasEnTranslation,
} ) );
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

function mockChat( chat: Chat, { isUserEligibleForPaidSupport = false } = {} ) {
	jest.mocked( useOdieAssistantContext ).mockReturnValue( {
		trackEvent: jest.fn(),
		chat,
		canConnectToZendesk: true,
		forceEmailSupport: false,
		isChatRestricted: false,
		isUserEligibleForPaidSupport,
	} as unknown as ReturnType< typeof useOdieAssistantContext > );
}

function renderInput(
	route: string,
	{ strict = false, aiDisclosureId }: { strict?: boolean; aiDisclosureId?: string } = {}
) {
	const tree = (
		<MemoryRouter initialEntries={ [ route ] }>
			<OdieSendMessageButton aiDisclosureId={ aiDisclosureId } />
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

describe( 'OdieSendMessageButton while a chat with a human starts', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( useSendChatMessage ).mockReturnValue( { sendMessage, abort: jest.fn() } );
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

describe( 'OdieSendMessageButton AI note', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( useSendChatMessage ).mockReturnValue( { sendMessage, abort: jest.fn() } );
		mockTextarea = null;
		mockHasEnTranslation = true;
		mockChat( makeChat() );
	} );

	it( 'hides the note when the AI line is hidden', () => {
		renderInput( '/odie' );

		expect( screen.queryByText( /Responses may be inaccurate/ ) ).not.toBeInTheDocument();
	} );

	it( 'says only that responses may be inaccurate', () => {
		renderInput( '/odie', { aiDisclosureId: 'line-id' } );

		expect( screen.getByText( /Responses may be inaccurate/ ) ).toBeInTheDocument();
		expect( screen.queryByText( /chatting with/ ) ).not.toBeInTheDocument();
	} );

	it( 'keeps the old note until the new one is translated', () => {
		mockHasEnTranslation = false;
		renderInput( '/odie', { aiDisclosureId: 'line-id' } );

		expect( screen.getByText( /You’re chatting with an AI assistant/ ) ).toBeInTheDocument();
	} );

	it( 'describes the input with the AI line, then the note', () => {
		mockTextarea = document.createElement( 'textarea' );
		renderInput( '/odie', { aiDisclosureId: 'line-id' } );

		const noteId = screen.getByText( /Responses may be inaccurate/ ).closest( '[id]' )?.id;
		expect( noteId ).toBeTruthy();
		expect( mockTextarea ).toHaveAttribute( 'aria-describedby', `line-id ${ noteId }` );
	} );
} );
