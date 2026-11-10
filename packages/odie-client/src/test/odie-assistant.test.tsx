/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { OdieAssistant } from '..';
import { useOdieAssistantContext } from '../context';
import { useCurrentSupportInteraction } from '../data/use-current-support-interaction';
import type { Chat, SupportInteraction } from '../types';

const mockSendMessageButtonProps = jest.fn();

jest.mock( '@automattic/zendesk-client', () => ( { zendeskMessageConverter: jest.fn() } ) );
jest.mock( '../context', () => ( {
	useOdieAssistantContext: jest.fn(),
	OdieAssistantProvider: () => null,
} ) );
jest.mock( '../data/use-current-support-interaction', () => ( {
	useCurrentSupportInteraction: jest.fn(),
} ) );
jest.mock( '../hooks/use-open-interaction-status-map', () => ( {
	useOpenLiveInteractions: () => ( { mostRecentSupportInteractionId: null, openCount: 0 } ),
} ) );
jest.mock( '../hooks/use-refresh-chat-on-focus', () => ( { useRefreshChatOnFocus: jest.fn() } ) );
jest.mock( '../components/message/messages-container', () => ( {
	MessagesContainer: () => <div>Messages</div>,
} ) );
jest.mock( '../components/closed-conversation-footer', () => ( {
	ClosedConversationFooter: () => null,
} ) );
jest.mock( '../components/send-message-input', () => ( {
	OdieSendMessageButton: ( props: { aiDisclosureId?: string } ) => {
		mockSendMessageButtonProps( props );
		return null;
	},
} ) );

function setUp( {
	provider = 'odie',
	sources = [ 'odie' ],
	isLoading = false,
	status = 'open',
	chatStatus = 'loaded',
}: {
	provider?: Chat[ 'provider' ];
	sources?: string[];
	isLoading?: boolean;
	status?: string;
	chatStatus?: Chat[ 'status' ];
} = {} ) {
	jest.mocked( useOdieAssistantContext ).mockReturnValue( {
		trackEvent: jest.fn(),
		currentUser: { display_name: 'Me' },
		chat: { messages: [], conversationId: null, provider, status: chatStatus } as Chat,
		productName: 'WordPress.com',
	} as unknown as ReturnType< typeof useOdieAssistantContext > );
	jest.mocked( useCurrentSupportInteraction ).mockReturnValue( {
		data: {
			uuid: 'interaction-1',
			status,
			events: sources.map( ( event_source ) => ( { event_external_id: '1', event_source } ) ),
		} as SupportInteraction,
		isLoading,
	} as unknown as ReturnType< typeof useCurrentSupportInteraction > );
}

const LINE = 'You’re chatting with AI from WordPress.com Support.';

describe( 'OdieAssistant AI disclosure line', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'shows the line with the product above the messages', () => {
		setUp();
		render( <OdieAssistant /> );

		const line = screen.getByText( LINE );
		expect( line.compareDocumentPosition( screen.getByText( 'Messages' ) ) ).toBe(
			Node.DOCUMENT_POSITION_FOLLOWING
		);
	} );

	it( 'describes the input with the line', () => {
		setUp();
		render( <OdieAssistant /> );

		expect( mockSendMessageButtonProps ).toHaveBeenLastCalledWith( {
			aiDisclosureId: screen.getByText( LINE ).id,
		} );
	} );

	it( 'hides the line while the interaction loads', () => {
		setUp( { isLoading: true } );
		render( <OdieAssistant /> );

		expect( screen.queryByText( LINE ) ).not.toBeInTheDocument();
	} );

	it( 'hides the line once the transfer to a person is recorded', () => {
		setUp( { sources: [ 'odie', 'zendesk' ], chatStatus: 'transfer' } );
		render( <OdieAssistant /> );

		expect( screen.queryByText( LINE ) ).not.toBeInTheDocument();
	} );

	it( 'shows the line again after a failed handoff', () => {
		setUp( { sources: [ 'odie', 'zendesk' ] } );
		render( <OdieAssistant /> );

		expect( screen.getByText( LINE ) ).toBeInTheDocument();
		expect( mockSendMessageButtonProps ).toHaveBeenLastCalledWith( {
			aiDisclosureId: screen.getByText( LINE ).id,
		} );
	} );

	it( 'keeps the line on a past AI chat whose interaction has ended', () => {
		setUp( { status: 'closed' } );
		render( <OdieAssistant /> );

		expect( screen.getByText( LINE ) ).toBeInTheDocument();
		expect( mockSendMessageButtonProps ).not.toHaveBeenCalled();
	} );

	it( 'hides the line once the chat is with a person', () => {
		setUp( { provider: 'zendesk' } );
		render( <OdieAssistant /> );

		expect( screen.queryByText( LINE ) ).not.toBeInTheDocument();
	} );

	it( 'hides the line while the chat loads its first messages', () => {
		setUp( { chatStatus: 'loading' } );
		render( <OdieAssistant /> );

		expect( screen.queryByText( LINE ) ).not.toBeInTheDocument();
	} );
} );
