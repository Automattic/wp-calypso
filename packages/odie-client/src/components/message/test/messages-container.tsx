/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useOdieAssistantContext } from '../../../context';
import { CHAT_CLIENT_TIMEOUT_MS, MessagesContainer } from '../messages-container';
import type {
	HumanSupportRequest,
	HumanSupportRouting,
	HumanSupportRoutingStepProps,
} from '../../../types';

const mockCreateZendeskConversation = jest.fn();
const mockNavigate = jest.fn();
const mockSetSearchParams = jest.fn();
const mockGetOpenLiveInteractions = jest.fn();
const mockAddMessage = jest.fn();
const mockTrackEvent = jest.fn();

// Changed by each test.
let mockSearchParams = new URLSearchParams();

jest.mock( '@automattic/i18n-utils', () => ( {
	useHasEnTranslation: () => () => true,
} ) );

jest.mock( '@automattic/zendesk-client', () => ( {
	isTestModeEnvironment: () => false,
} ) );

jest.mock( '@wordpress/components', () => ( {
	Spinner: () => null,
} ) );

jest.mock( 'react-router-dom', () => ( {
	useNavigate: () => mockNavigate,
	useNavigationType: () => 'PUSH',
	useSearchParams: () => [ mockSearchParams, mockSetSearchParams ],
} ) );

jest.mock( '../../../constants', () => ( {
	getConversationLimitReachedMessage: () => ( { internal_message_id: 'limit' } ),
	getOdieEmailFallbackMessage: () => ( { internal_message_id: 'email-fallback' } ),
	getOdieInitialMessage: () => ( { content: 'Hi', role: 'bot', type: 'message' } ),
	getOdieZendeskConnectionErrorMessage: () => ( { internal_message_id: 'connection-error' } ),
	ODIE_DEFAULT_BOT_SLUG_LEGACY: 'wpcom-support-chat',
} ) );

jest.mock( '../../../context', () => ( {
	useOdieAssistantContext: jest.fn(),
} ) );

jest.mock( '../../../data/use-current-support-interaction', () => ( {
	useCurrentSupportInteraction: () => ( { data: undefined } ),
} ) );

jest.mock( '../../../hooks', () => ( {
	useAutoScroll: () => false,
	useCreateZendeskConversation: () => mockCreateZendeskConversation,
	// Without a routing step, asking for a human starts the chat.
	useRequestHumanSupport:
		() =>
		( { flags, ...request }: { flags: unknown; createdFrom: string } ) =>
			mockCreateZendeskConversation( request ),
	useZendeskMessageListener: () => {},
	useUpdateDocumentTitle: () => {},
} ) );

jest.mock( '../../../hooks/use-help-center-chat-scroll', () => ( {
	useHelpCenterChatScroll: () => {},
} ) );

jest.mock( '../../../hooks/use-open-interaction-status-map', () => ( {
	useOpenInteractionStatusMap: () => ( {} ),
} ) );

jest.mock( '../../../utils/get-open-live-interactions', () => ( {
	getOpenLiveInteractions: () => mockGetOpenLiveInteractions(),
} ) );

jest.mock( '..', () => ( { __esModule: true, default: () => null } ) );
jest.mock( '../jump-to-recent', () => ( { JumpToRecent: () => null } ) );
jest.mock( '../messages-cluster/messages-cluster', () => ( { MessagesClusterizer: () => null } ) );
jest.mock( '../thinking-placeholder', () => ( {
	ThinkingPlaceholder: ( { content }: { content?: string } ) => <p>{ content }</p>,
} ) );
jest.mock( '../zendesk-typing-indicator', () => ( { ZendeskTypingIndicator: () => null } ) );

const mockSetPendingHumanSupportRequest = jest.fn();

const RoutingStep = ( { request, startChat, dismiss }: HumanSupportRoutingStepProps ) => (
	<div>
		<p>Routing { request.createdFrom }</p>
		<button onClick={ startChat }>Start chat</button>
		<button onClick={ dismiss }>Dismiss</button>
	</div>
);

const mockContext = ( {
	isUserEligibleForPaidSupport = true,
	isChatLoaded = true,
	forceEmailSupport = false,
	chatStatus = 'loaded',
	humanSupportRouting = null as HumanSupportRouting | null,
	pendingHumanSupportRequest = null as HumanSupportRequest | null,
} = {} ) => {
	( useOdieAssistantContext as jest.Mock ).mockReturnValue( {
		chat: {
			provider: 'odie',
			conversationId: null,
			odieId: null,
			messages: [],
			status: chatStatus,
		},
		addMessage: mockAddMessage,
		trackEvent: mockTrackEvent,
		isChatLoaded,
		isUserEligibleForPaidSupport,
		forceEmailSupport,
		isLoadingZendeskHistory: false,
		humanSupportRouting,
		pendingHumanSupportRequest,
		setPendingHumanSupportRequest: mockSetPendingHumanSupportRequest,
	} );
};

// A new element each time, so a rerender renders again with the current context.
const container = () => (
	<MessagesContainer currentUser={ { ID: 1, display_name: 'Test' } as never } />
);

const renderDirectLink = ( context: Parameters< typeof mockContext >[ 0 ] = {} ) => {
	mockSearchParams = new URLSearchParams( 'provider=zendesk' );
	mockContext( context );
	return render( container() );
};

beforeEach( () => {
	jest.clearAllMocks();
	// No open live chat to go back to, and below the limit.
	mockGetOpenLiveInteractions.mockReturnValue( {
		mostRecentSupportInteractionId: null,
		hasReachedLimit: false,
	} );
} );

describe( 'MessagesContainer direct link to a human', () => {
	it( 'opens a new human chat with paid support', () => {
		// The chat client is loaded.
		renderDirectLink();

		expect( mockCreateZendeskConversation ).toHaveBeenCalledWith( { createdFrom: 'direct_url' } );
		expect( mockAddMessage ).not.toHaveBeenCalled();
	} );

	it( "doesn't open a new human chat without paid support, even with the chat client loaded", () => {
		// For example, to reopen an open human chat.
		renderDirectLink( { isUserEligibleForPaidSupport: false } );

		expect( mockCreateZendeskConversation ).not.toHaveBeenCalled();
		expect( mockSearchParams.get( 'provider' ) ).toBeNull();
	} );

	it( 'offers email instead when support is email-only', () => {
		renderDirectLink( { forceEmailSupport: true } );

		expect( mockCreateZendeskConversation ).not.toHaveBeenCalled();
		expect( mockAddMessage ).toHaveBeenCalledWith( { internal_message_id: 'email-fallback' } );
		expect( mockTrackEvent ).toHaveBeenCalledWith( 'direct_chat_unavailable', {
			reason: 'email_only',
		} );
		expect( mockSearchParams.get( 'provider' ) ).toBeNull();
	} );

	it( 'waits for the chat to load before saying why', () => {
		const { rerender } = renderDirectLink( { forceEmailSupport: true, chatStatus: 'loading' } );

		expect( mockAddMessage ).not.toHaveBeenCalled();
		expect( mockSearchParams.get( 'provider' ) ).toBe( 'zendesk' );

		mockContext( { forceEmailSupport: true } );
		rerender( container() );

		expect( mockAddMessage ).toHaveBeenCalledWith( { internal_message_id: 'email-fallback' } );
	} );

	it( 'offers the open chats when the user has reached the limit', () => {
		mockGetOpenLiveInteractions.mockReturnValue( {
			mostRecentSupportInteractionId: null,
			hasReachedLimit: true,
		} );

		renderDirectLink();

		expect( mockCreateZendeskConversation ).not.toHaveBeenCalled();
		expect( mockAddMessage ).toHaveBeenCalledWith( { internal_message_id: 'limit' } );
		expect( mockAddMessage ).toHaveBeenCalledTimes( 1 );
	} );

	describe( 'while the chat client loads', () => {
		beforeEach( () => {
			jest.useFakeTimers();
		} );

		afterEach( () => {
			jest.useRealTimers();
		} );

		it( 'shows that a human is being requested', () => {
			renderDirectLink( { isChatLoaded: false } );

			expect( screen.getByText( 'Requesting human support…' ) ).toBeInTheDocument();
			expect( mockCreateZendeskConversation ).not.toHaveBeenCalled();
			expect( mockAddMessage ).not.toHaveBeenCalled();
		} );

		it( 'says it could not connect when the chat client takes too long', () => {
			renderDirectLink( { isChatLoaded: false } );

			act( () => {
				jest.advanceTimersByTime( CHAT_CLIENT_TIMEOUT_MS );
			} );

			expect( mockAddMessage ).toHaveBeenCalledWith( { internal_message_id: 'connection-error' } );
			expect( mockAddMessage ).toHaveBeenCalledTimes( 1 );
			expect( mockTrackEvent ).toHaveBeenCalledWith( 'direct_chat_unavailable', {
				reason: 'chat_client_timeout',
			} );
			expect( mockSearchParams.get( 'provider' ) ).toBeNull();
			expect( mockCreateZendeskConversation ).not.toHaveBeenCalled();
		} );

		it( 'opens the chat when the chat client loads in time', () => {
			const { rerender } = renderDirectLink( { isChatLoaded: false } );

			act( () => {
				jest.advanceTimersByTime( CHAT_CLIENT_TIMEOUT_MS - 1 );
			} );
			mockContext( { isChatLoaded: true } );
			rerender( container() );
			act( () => {
				jest.advanceTimersByTime( CHAT_CLIENT_TIMEOUT_MS );
			} );

			expect( mockCreateZendeskConversation ).toHaveBeenCalledWith( { createdFrom: 'direct_url' } );
			expect( mockAddMessage ).not.toHaveBeenCalled();
		} );
	} );
} );

describe( 'MessagesContainer routing step', () => {
	const request: HumanSupportRequest = {
		createdFrom: 'automatic_escalation',
		isFromError: false,
		escalationOnSecondAttempt: true,
		flags: { isEmergency: true, emergencyType: 'site_down', routeToEmail: false },
	};

	it( 'shows the routing step for a pending request', () => {
		mockContext( {
			humanSupportRouting: { Step: RoutingStep },
			pendingHumanSupportRequest: request,
		} );
		render( container() );

		expect( screen.getByText( 'Routing automatic_escalation' ) ).toBeInTheDocument();
		expect( mockCreateZendeskConversation ).not.toHaveBeenCalled();
	} );

	it( "doesn't show it without a pending request", () => {
		mockContext( { humanSupportRouting: { Step: RoutingStep } } );
		render( container() );

		expect( screen.queryByText( /Routing/ ) ).not.toBeInTheDocument();
	} );

	it( 'starts the chat for the request when the step chooses chat', async () => {
		mockContext( {
			humanSupportRouting: { Step: RoutingStep },
			pendingHumanSupportRequest: request,
		} );
		render( container() );

		await userEvent.click( screen.getByText( 'Start chat' ) );

		expect( mockSetPendingHumanSupportRequest ).toHaveBeenCalledWith( null );
		expect( mockCreateZendeskConversation ).toHaveBeenCalledWith( {
			createdFrom: 'automatic_escalation',
			isFromError: false,
			escalationOnSecondAttempt: true,
		} );
	} );

	it( 'drops the request when the step dismisses it', async () => {
		mockContext( {
			humanSupportRouting: { Step: RoutingStep },
			pendingHumanSupportRequest: request,
		} );
		render( container() );

		await userEvent.click( screen.getByText( 'Dismiss' ) );

		expect( mockSetPendingHumanSupportRequest ).toHaveBeenCalledWith( null );
		expect( mockCreateZendeskConversation ).not.toHaveBeenCalled();
	} );

	it( 'requests a human from a direct link without paid support', () => {
		// The routing step decides who gets a human.
		renderDirectLink( {
			isUserEligibleForPaidSupport: false,
			humanSupportRouting: { Step: RoutingStep },
		} );

		expect( mockCreateZendeskConversation ).toHaveBeenCalledWith( { createdFrom: 'direct_url' } );
	} );
} );
