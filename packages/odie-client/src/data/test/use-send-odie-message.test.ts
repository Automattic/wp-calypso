/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { broadcastOdieMessage } from '..';
import { useOdieAssistantContext } from '../../context';
import { useSendOdieMessage } from '../use-send-odie-message';
import type { Chat, Message, ReturnedChat } from '../../types';

/**
 * Mutable state backing the mocked dependencies. Each test mutates these to
 * drive the hook through the scenario under test.
 */
const mockSetChat = jest.fn();
const mockTrackEvent = jest.fn();
const mockCreateZendeskConversation = jest.fn();
const mockUseMutation = jest.fn();
let mockHasReachedLimit = false;

jest.mock( '@automattic/data-stores', () => ( {
	HelpCenter: { register: () => 'automattic/help-center' },
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	useMutation: ( options: unknown ) => mockUseMutation( options ),
	useQueryClient: () => ( { invalidateQueries: jest.fn() } ),
} ) );

jest.mock( '@wordpress/api-fetch', () => jest.fn() );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( { setLoggedOutOdieChat: jest.fn() } ),
	// The hook's only useSelect call returns the current user.
	useSelect: () => ( { ID: 1 } ),
} ) );

jest.mock( 'react-router-dom', () => ( {
	useLocation: () => ( { search: '?id=int-1', pathname: '/odie' } ),
	useNavigate: () => jest.fn(),
} ) );

jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	canAccessWpcomApis: () => true,
} ) );

jest.mock( '../../constants', () => ( {
	getOdieRateLimitMessage: () => ( { content: 'rate-limited', role: 'bot', type: 'message' } ),
	getOdieEmailFallbackMessage: () => ( {
		content: 'email-fallback',
		role: 'bot',
		type: 'message',
	} ),
	getOdieErrorMessageNonEligible: () => 'offline',
	getExistingConversationMessage: () => ( {
		content: '',
		role: 'bot',
		type: 'message',
		internal_message_id: 'existing-conversation-message',
	} ),
	getConversationLimitReachedMessage: () => ( {
		content: 'limit-reached',
		role: 'bot',
		type: 'message',
		internal_message_id: 'conversation-limit-reached-message',
	} ),
	getErrorMessageUnknownError: () => ( { content: 'unknown-error', role: 'bot', type: 'message' } ),
} ) );

jest.mock( '../../context', () => ( {
	useOdieAssistantContext: jest.fn(),
} ) );

jest.mock( '../../hooks', () => ( {
	useCreateZendeskConversation: () => mockCreateZendeskConversation,
} ) );

jest.mock( '../../hooks/use-logged-out-session', () => ( {
	useLoggedOutSession: () => ( {
		isLoggedOutSession: false,
		loggedOutOdieChatId: null,
		sessionId: null,
		botSlug: null,
	} ),
} ) );

jest.mock( '../../hooks/use-open-interaction-status-map', () => ( {
	useOpenInteractionStatusMap: () => new Map(),
} ) );

jest.mock( '../../utils', () => ( {
	generateUUID: () => 'internal-1',
	// Matches the chat id Odie returns below, so no interaction event is added.
	getOdieIdFromInteraction: () => '7',
	getIsRequestingHumanSupport: ( message: {
		context?: { flags?: { forward_to_human_support?: boolean } };
	} ) => message.context?.flags?.forward_to_human_support ?? false,
} ) );

jest.mock( '../../utils/chat-utils', () => ( {
	hasRecentEscalationAttempt: () => false,
} ) );

jest.mock( '../../utils/get-bot-slug', () => ( {
	getBotSlug: () => 'wpcom-support-chat',
} ) );

jest.mock( '../../utils/get-open-live-interactions', () => ( {
	getOpenLiveInteractions: () => ( {
		mostRecentSupportInteractionId: null,
		hasReachedLimit: mockHasReachedLimit,
	} ),
} ) );

jest.mock( '../../utils/is-agents-manager-available', () => ( {
	getIsAgentsManagerAvailable: () => false,
} ) );

jest.mock( '../request-logged-out-wpcom-odie', () => ( {
	requestLoggedOutWpcomOdie: jest.fn(),
} ) );

jest.mock( '../use-current-support-interaction', () => ( {
	useCurrentSupportInteraction: () => ( { data: { uuid: 'int-1' } } ),
} ) );

jest.mock( '..', () => ( {
	useManageSupportInteraction: () => ( {
		addEventToInteraction: jest.fn(),
		startNewInteraction: jest.fn(),
	} ),
	broadcastOdieMessage: jest.fn(),
} ) );

const baseChat: Chat = {
	odieId: 7,
	conversationId: null,
	messages: [],
	wpcomUserId: 99,
	provider: 'odie',
	status: 'loaded',
};

type MutationOptions = {
	onSuccess: ( returnedChat: ReturnedChat ) => Promise< void >;
	onError: ( error: Error ) => void;
};

// Renders the hook and returns the callbacks it registered with useMutation.
const renderSendOdieMessage = (): MutationOptions => {
	renderHook( () => useSendOdieMessage( new AbortController().signal ) );
	return mockUseMutation.mock.calls.at( -1 )?.[ 0 ];
};

const odieReply = ( overrides: Partial< Message > = {} ): ReturnedChat => ( {
	chat_id: 7,
	session_id: '',
	wpcom_user_id: 99,
	experiment_name: null,
	messages: [
		{ content: 'bot reply', message_id: 1, role: 'bot', type: 'message', ...overrides } as Message,
	],
} );

// Every message the hook appended, by replaying its setChat updaters on an empty chat.
const appendedMessages = () =>
	mockSetChat.mock.calls.flatMap( ( [ update ] ) =>
		typeof update === 'function' ? update( baseChat ).messages : update.messages
	);

beforeEach( () => {
	jest.clearAllMocks();
	mockHasReachedLimit = false;
	( useOdieAssistantContext as jest.Mock ).mockReturnValue( {
		selectedSiteId: 1,
		version: null,
		setChat: mockSetChat,
		odieBroadcastClientId: 'this-tab',
		setChatStatus: jest.fn(),
		setExperimentVariationName: jest.fn(),
		chat: baseChat,
		isUserEligibleForPaidSupport: true,
		canConnectToZendesk: true,
		forceEmailSupport: false,
		trackEvent: mockTrackEvent,
		newInteractionsBotSlug: 'wpcom-support-chat',
		newLoggedOutInteractionsBotSlug: 'wpcom-support-chat',
		externalChatProvider: null,
		externalChatId: null,
	} );
} );

describe( 'useSendOdieMessage — mirroring replies into other tabs', () => {
	it( 'mirrors the bot reply to other tabs on the same support interaction', async () => {
		const { onSuccess } = renderSendOdieMessage();

		await act( async () => {
			await onSuccess( odieReply() );
		} );

		expect( appendedMessages() ).toEqual( [
			expect.objectContaining( { content: 'bot reply', role: 'bot' } ),
		] );
		expect( broadcastOdieMessage ).toHaveBeenCalledWith(
			expect.objectContaining( { content: 'bot reply', role: 'bot' } ),
			'this-tab',
			'int-1'
		);
	} );

	it( 'keeps a send failure in the tab that sent the message', () => {
		const { onError } = renderSendOdieMessage();

		act( () => {
			onError( new Error( 'Request failed with status 500' ) );
		} );

		expect( appendedMessages() ).toEqual( [
			expect.objectContaining( { content: 'unknown-error' } ),
		] );
		expect( broadcastOdieMessage ).not.toHaveBeenCalled();
	} );

	it( 'keeps a rate limit notice in the tab that hit it', () => {
		const { onError } = renderSendOdieMessage();

		act( () => {
			onError( new Error( 'Request failed with status 429' ) );
		} );

		expect( appendedMessages() ).toEqual( [
			expect.objectContaining( { content: 'rate-limited' } ),
		] );
		expect( broadcastOdieMessage ).not.toHaveBeenCalled();
	} );

	it( 'does not mirror a reply this tab replaces with an automatic escalation', async () => {
		const { onSuccess } = renderSendOdieMessage();

		await act( async () => {
			await onSuccess(
				odieReply( { context: { site_id: null, flags: { forward_to_human_support: true } } } )
			);
		} );

		// This tab never shows the reply: it moves the chat to Zendesk instead, and
		// the other tabs follow through the interaction-updated broadcast.
		expect( appendedMessages() ).toEqual( [] );
		expect( mockCreateZendeskConversation ).toHaveBeenCalledWith(
			expect.objectContaining( { createdFrom: 'automatic_escalation' } )
		);
		expect( broadcastOdieMessage ).not.toHaveBeenCalled();
	} );

	it( 'mirrors the notice shown in place of the reply when the conversation limit is reached', async () => {
		mockHasReachedLimit = true;
		const { onSuccess } = renderSendOdieMessage();

		await act( async () => {
			await onSuccess(
				odieReply( { context: { site_id: null, flags: { forward_to_human_support: true } } } )
			);
		} );

		const limitNotice = expect.objectContaining( {
			internal_message_id: 'conversation-limit-reached-message',
		} );
		expect( appendedMessages() ).toEqual( [ limitNotice ] );
		expect( broadcastOdieMessage ).toHaveBeenCalledTimes( 1 );
		expect( broadcastOdieMessage ).toHaveBeenCalledWith( limitNotice, 'this-tab', 'int-1' );
	} );
} );
