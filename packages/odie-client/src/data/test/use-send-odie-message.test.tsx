/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import wpcomRequest from 'wpcom-proxy-request';
import { useOdieAssistantContext } from '../../context';
import { useSendOdieMessage } from '../use-send-odie-message';
import type { Message } from '../../types';
import type { ReactNode } from 'react';

jest.mock( '@automattic/data-stores', () => ( {
	HelpCenter: { register: () => 'automattic/help-center' },
} ) );

jest.mock( '@automattic/zendesk-client', () => ( {
	isTestModeEnvironment: () => false,
} ) );

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( selector: ( select: unknown ) => unknown ) =>
		selector( () => ( { getCurrentUser: () => ( { ID: 1 } ) } ) ),
	useDispatch: () => ( { setLoggedOutOdieChat: jest.fn() } ),
} ) );

jest.mock( 'react-router-dom', () => ( {
	useLocation: () => ( { search: '', pathname: '/odie' } ),
	useNavigate: () => jest.fn(),
} ) );

jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	canAccessWpcomApis: () => true,
} ) );

jest.mock( '../../context', () => ( {
	useOdieAssistantContext: jest.fn(),
} ) );

const mockRequestHumanSupport = jest.fn();

jest.mock( '../../hooks', () => ( {
	useCreateZendeskConversation: () => jest.fn(),
	useRequestHumanSupport: () => mockRequestHumanSupport,
} ) );

jest.mock( '../../hooks/use-logged-out-session', () => ( {
	useLoggedOutSession: () => ( { isLoggedOutSession: false } ),
} ) );

jest.mock( '../../hooks/use-open-interaction-status-map', () => ( {
	useOpenInteractionStatusMap: () => ( {} ),
} ) );

jest.mock( '../../utils/is-agents-manager-available', () => ( {
	getIsAgentsManagerAvailable: () => false,
} ) );

jest.mock( '../use-current-support-interaction', () => ( {
	useCurrentSupportInteraction: () => ( { data: undefined } ),
} ) );

jest.mock( '../request-logged-out-wpcom-odie', () => ( {
	requestLoggedOutWpcomOdie: jest.fn(),
} ) );

// The hook imports useManageSupportInteraction from the data barrel.
jest.mock( '../index', () => ( {
	useManageSupportInteraction: () => ( {
		addEventToInteraction: jest.fn(),
		startNewInteraction: jest.fn().mockResolvedValue( { uuid: 'interaction-1' } ),
	} ),
} ) );

const userMessage: Message = {
	content: 'Can I pay for the plan with PayPal?',
	role: 'user',
	type: 'message',
};

const mockContext = ( overrides: Record< string, unknown > = {} ) =>
	( useOdieAssistantContext as jest.Mock ).mockReturnValue( {
		selectedSiteId: 1,
		version: null,
		setChat: jest.fn(),
		setChatStatus: jest.fn(),
		setExperimentVariationName: jest.fn(),
		chat: { odieId: null, conversationId: null, messages: [], provider: 'odie', status: 'loaded' },
		isUserEligibleForPaidSupport: false,
		canConnectToZendesk: false,
		forceEmailSupport: false,
		trackEvent: jest.fn(),
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

	return ( wpcomRequest as jest.Mock ).mock.calls[ 0 ][ 0 ].body;
};

describe( 'useSendOdieMessage – checkout support variation', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( wpcomRequest as jest.Mock ).mockResolvedValue( {
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
		jest.clearAllMocks();
		( wpcomRequest as jest.Mock ).mockResolvedValue( {
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

	it( "doesn't ask for a human for a user without paid support or a routing step", async () => {
		mockContext( { canConnectToZendesk: true } );

		await sendMessage();

		expect( mockRequestHumanSupport ).not.toHaveBeenCalled();
	} );
} );
