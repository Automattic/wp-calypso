/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import wpcomRequest from 'wpcom-proxy-request';
import { useOdieAssistantContext } from '../../context';
import { useSendOdieMessage } from '../use-send-odie-message';
import type { Message } from '../../types';
import type { ReactNode } from 'react';

vi.mock( '@automattic/data-stores', () => ( {
	HelpCenter: { register: () => 'automattic/help-center' },
} ) );

vi.mock( '@automattic/zendesk-client', () => ( {
	isTestModeEnvironment: () => false,
} ) );

vi.mock( '@wordpress/data', () => ( {
	useSelect: ( selector: ( select: unknown ) => unknown ) =>
		selector( () => ( { getCurrentUser: () => ( { ID: 1 } ) } ) ),
	useDispatch: () => ( { setLoggedOutOdieChat: vi.fn() } ),
} ) );

vi.mock( 'react-router-dom', () => ( {
	useLocation: () => ( { search: '', pathname: '/odie' } ),
	useNavigate: () => vi.fn(),
} ) );

vi.mock( 'wpcom-proxy-request', () => ( {
	default: vi.fn(),
	canAccessWpcomApis: () => true,
} ) );

vi.mock( '../../context', () => ( {
	useOdieAssistantContext: vi.fn(),
} ) );

const mockRequestHumanSupport = vi.fn();

vi.mock( '../../hooks', () => ( {
	useCreateZendeskConversation: () => vi.fn(),
	useRequestHumanSupport: () => mockRequestHumanSupport,
} ) );

vi.mock( '../../hooks/use-logged-out-session', () => ( {
	useLoggedOutSession: () => ( { isLoggedOutSession: false } ),
} ) );

vi.mock( '../../hooks/use-open-interaction-status-map', () => ( {
	useOpenInteractionStatusMap: () => ( {} ),
} ) );

const mockGetOpenLiveInteractions = vi.fn( () => ( {
	mostRecentSupportInteractionId: null as string | null,
	hasReachedLimit: false,
} ) );

vi.mock( '../../utils/get-open-live-interactions', () => ( {
	getOpenLiveInteractions: () => mockGetOpenLiveInteractions(),
} ) );

vi.mock( '../../utils/is-agents-manager-available', () => ( {
	getIsAgentsManagerAvailable: () => false,
} ) );

vi.mock( '../use-current-support-interaction', () => ( {
	useCurrentSupportInteraction: () => ( { data: undefined } ),
} ) );

vi.mock( '../request-logged-out-wpcom-odie', () => ( {
	requestLoggedOutWpcomOdie: vi.fn(),
} ) );

// The hook imports useManageSupportInteraction from the data barrel.
vi.mock( '../index', () => ( {
	useManageSupportInteraction: () => ( {
		addEventToInteraction: vi.fn(),
		startNewInteraction: vi.fn().mockResolvedValue( { uuid: 'interaction-1' } ),
	} ),
} ) );

const userMessage: Message = {
	content: 'Can I pay for the plan with PayPal?',
	role: 'user',
	type: 'message',
};

const mockSetChat = vi.fn();
const mockSetPendingHumanSupportRequest = vi.fn();

const mockContext = ( overrides: Record< string, unknown > = {} ) =>
	( useOdieAssistantContext as Mock ).mockReturnValue( {
		selectedSiteId: 1,
		version: null,
		setChat: mockSetChat,
		setPendingHumanSupportRequest: mockSetPendingHumanSupportRequest,
		setChatStatus: vi.fn(),
		setExperimentVariationName: vi.fn(),
		chat: { odieId: null, conversationId: null, messages: [], provider: 'odie', status: 'loaded' },
		isUserEligibleForPaidSupport: false,
		canConnectToZendesk: false,
		forceEmailSupport: false,
		trackEvent: vi.fn(),
		newInteractionsBotSlug: 'wpcom-workflow-support_chat',
		newLoggedOutInteractionsBotSlug: 'wpcom-workflow-chat_loggedout',
		externalChatProvider: null,
		externalChatId: null,
		...overrides,
	} );

const sendMessage = async () => {
	const queryClient = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);
	const { result } = renderHook( () => useSendOdieMessage( new AbortController().signal ), {
		wrapper,
	} );

	await act( async () => {
		await result.current.mutateAsync( userMessage );
	} );

	return ( wpcomRequest as Mock ).mock.calls[ 0 ][ 0 ].body;
};

describe( 'useSendOdieMessage – checkout support variation', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		( wpcomRequest as Mock ).mockResolvedValue( {
			chat_id: 5,
			messages: [ { message_id: 1, content: 'Yes, PayPal works.', role: 'bot', type: 'message' } ],
		} );
	} );

	it( 'sends the variation in the request context', async () => {
		mockContext( { checkoutSupportVariation: 'hybrid' } );

		const body = await sendMessage();

		expect( body.context ).toMatchObject( {
			selectedSiteId: 1,
			pathname: window.location.pathname,
			checkoutSupportVariation: 'hybrid',
		} );
	} );

	it( 'leaves the variation out when support was not opened from checkout', async () => {
		mockContext();

		const body = await sendMessage();

		expect( body.context ).not.toHaveProperty( 'checkoutSupportVariation' );
	} );
} );

describe( 'useSendOdieMessage – asking for a human', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		( wpcomRequest as Mock ).mockResolvedValue( {
			chat_id: 5,
			messages: [
				{
					message_id: 1,
					content: 'Let me connect you with a Happiness Engineer.',
					role: 'bot',
					type: 'message',
					context: {
						site_id: null,
						flags: {
							forward_to_human_support: true,
							is_emergency: true,
							emergency_type: 'checkout_broken',
							route_to_email: false,
						},
					},
				},
			],
		} );
	} );

	it( "passes the bot's flags with the request", async () => {
		mockContext( { isUserEligibleForPaidSupport: true, canConnectToZendesk: true } );

		await sendMessage();

		expect( mockRequestHumanSupport ).toHaveBeenCalledWith(
			expect.objectContaining( {
				createdFrom: 'automatic_escalation',
				flags: { isEmergency: true, emergencyType: 'checkout_broken', routeToEmail: false },
			} )
		);
	} );

	it( 'lets a routing step decide for a user without paid support', async () => {
		mockContext( { canConnectToZendesk: true, humanSupportRouting: { Step: () => null } } );

		await sendMessage();

		expect( mockRequestHumanSupport ).toHaveBeenCalledWith(
			expect.objectContaining( { createdFrom: 'automatic_escalation' } )
		);
	} );

	it( "keeps the bot's flags on the existing-conversation prompt", async () => {
		mockGetOpenLiveInteractions.mockReturnValueOnce( {
			mostRecentSupportInteractionId: 'interaction-9',
			hasReachedLimit: false,
		} );
		mockContext( { isUserEligibleForPaidSupport: true, canConnectToZendesk: true } );

		await sendMessage();

		// The prompt is shown instead of starting a chat; its button needs the bot's flags.
		expect( mockRequestHumanSupport ).not.toHaveBeenCalled();
		const updates = mockSetChat.mock.calls
			.map( ( [ update ] ) => update )
			.filter( ( update ) => typeof update === 'function' );
		const chat = updates.reduce( ( prev, update ) => update( prev ), {
			messages: [],
			status: 'sending',
		} );
		expect( chat.messages.at( -1 ) ).toMatchObject( {
			internal_message_id: 'existing-conversation-message',
			context: {
				flags: {
					forward_to_human_support: true,
					is_emergency: true,
					emergency_type: 'checkout_broken',
				},
			},
		} );
	} );

	it( 'drops a waiting request for a human when the user writes to the bot again', async () => {
		mockContext( { canConnectToZendesk: true } );

		await sendMessage();

		expect( mockSetPendingHumanSupportRequest ).toHaveBeenCalledWith( null );
	} );

	it( "doesn't ask for a human for a user without paid support or a routing step", async () => {
		mockContext( { canConnectToZendesk: true } );

		await sendMessage();

		expect( mockRequestHumanSupport ).not.toHaveBeenCalled();
	} );
} );
