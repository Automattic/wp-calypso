/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { useOdieAssistantContext } from '../../../context';
import { MessagesContainer } from '../messages-container';

const mockCreateZendeskConversation = jest.fn();
const mockNavigate = jest.fn();
const mockSetSearchParams = jest.fn();
const mockGetOpenLiveInteractions = jest.fn();

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
	getOdieInitialMessage: () => ( { content: 'Hi', role: 'bot', type: 'message' } ),
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
jest.mock( '../thinking-placeholder', () => ( { ThinkingPlaceholder: () => null } ) );
jest.mock( '../zendesk-typing-indicator', () => ( { ZendeskTypingIndicator: () => null } ) );

const renderDirectLink = ( isUserEligibleForPaidSupport: boolean ) => {
	mockSearchParams = new URLSearchParams( 'provider=zendesk' );
	( useOdieAssistantContext as jest.Mock ).mockReturnValue( {
		chat: { provider: 'odie', conversationId: null, odieId: null, messages: [], status: 'loaded' },
		// The chat client is loaded, for example to reopen an open human chat.
		isChatLoaded: true,
		isUserEligibleForPaidSupport,
		forceEmailSupport: false,
		isLoadingZendeskHistory: false,
	} );

	render( <MessagesContainer currentUser={ { ID: 1, display_name: 'Test' } as never } /> );
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
		renderDirectLink( true );

		expect( mockCreateZendeskConversation ).toHaveBeenCalledWith( { createdFrom: 'direct_url' } );
	} );

	it( "doesn't open a new human chat without paid support, even with the chat client loaded", () => {
		renderDirectLink( false );

		expect( mockCreateZendeskConversation ).not.toHaveBeenCalled();
		expect( mockSearchParams.get( 'provider' ) ).toBeNull();
	} );
} );
