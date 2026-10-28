/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../../context';
import { useCreateZendeskConversation } from '../use-create-zendesk-conversation';

/**
 * Mutable state backing the mocked dependencies. Each test mutates these in
 * `beforeEach` (or inline) to drive the hook through the scenario under test.
 */
const mockTrackEvent = jest.fn();
const mockSetChat = jest.fn();
const mockSubmitUserFields = jest.fn();
const mockAddEventToInteraction = jest.fn();
const mockStartNewInteraction = jest.fn();
const mockGetOdieTransferMessages = jest.fn().mockReturnValue( [] );
let mockHasReachedLimit = false;

jest.mock( 'smooch', () => ( {
	__esModule: true,
	default: {
		createConversation: jest.fn(),
		updateConversation: jest.fn(),
		loadConversation: jest.fn(),
	},
} ) );

jest.mock( 'react-router-dom', () => ( {
	useLocation: () => ( { search: '', pathname: '/' } ),
	useNavigate: () => jest.fn(),
} ) );

jest.mock( '@automattic/zendesk-client', () => ( {
	// Like the real helper: empty values are left out.
	getTicketFieldMetadata: ( fields: Record< string, unknown > ) =>
		Object.fromEntries(
			Object.entries( fields )
				.filter( ( [ , value ] ) => value !== undefined && value !== null && value !== '' )
				.map( ( [ id, value ] ) => [ `zen:ticket_field:${ id }`, value ] )
		),
	useUpdateZendeskUserFields: () => ( {
		isPending: false,
		mutateAsync: mockSubmitUserFields,
	} ),
	ZENDESK_CUSTOM_FIELD_AI_CHAT_ID: 33538949515668,
	ZENDESK_CUSTOM_FIELD_WEBSITE_URL: 22054927,
	ZENDESK_SOURCE_URL_TICKET_FIELD_ID: 23752099174548,
} ) );

jest.mock( '../../context', () => ( {
	useOdieAssistantContext: jest.fn(),
} ) );

jest.mock( '../../data', () => ( {
	useManageSupportInteraction: () => ( {
		addEventToInteraction: mockAddEventToInteraction,
		startNewInteraction: mockStartNewInteraction,
	} ),
} ) );

jest.mock( '../../data/use-current-support-interaction', () => ( {
	useCurrentSupportInteraction: () => ( {
		data: { uuid: 'int-1', bot_slug: 'wpcom-support-chat' },
	} ),
} ) );

jest.mock( '../../utils/get-open-live-interactions', () => ( {
	getOpenLiveInteractions: () => ( { hasReachedLimit: mockHasReachedLimit } ),
} ) );

jest.mock( '../use-open-interaction-status-map', () => ( {
	useOpenInteractionStatusMap: () => ( {} ),
} ) );

jest.mock( '../../constants', () => ( {
	getErrorTryAgainLaterMessage: () => ( { content: 'try-again', role: 'bot', type: 'message' } ),
	getOdieTransferMessages: ( ...args: unknown[] ) => mockGetOdieTransferMessages( ...args ),
	getZendeskChatStartedMetaMessage: () => ( {
		content: 'chat-started',
		role: 'bot',
		type: 'message',
	} ),
} ) );

const smoochCreateConversation = Smooch.createConversation as jest.Mock;

const notReadyError = () => new TypeError( 'i(...).createConversation is not a function' );

// Returns the props object of the most recent trackEvent call for `name`.
const lastTrackedProps = ( name: string ) =>
	mockTrackEvent.mock.calls.filter( ( [ event ] ) => event === name ).at( -1 )?.[ 1 ];

beforeEach( () => {
	jest.clearAllMocks();
	jest.useFakeTimers();
	mockHasReachedLimit = false;
	mockSubmitUserFields.mockResolvedValue( undefined );
	// activeInteractionId === interaction.uuid, so updateConversation is skipped.
	mockAddEventToInteraction.mockResolvedValue( { uuid: 'int-1' } );
	mockStartNewInteraction.mockResolvedValue( { uuid: 'int-1' } );
	( useOdieAssistantContext as jest.Mock ).mockReturnValue( {
		selectedSiteId: 1,
		selectedSiteURL: 'https://example.com',
		userFieldMessage: 'help',
		userFieldFlowName: null,
		setChat: mockSetChat,
		chat: {
			odieId: 'odie-1',
			conversationId: null,
			messages: [],
			wpcomUserId: 99,
			clientId: 'client-1',
			provider: 'odie',
			status: 'loaded',
		},
		trackEvent: mockTrackEvent,
		isChatLoaded: true,
	} );
} );

afterEach( () => {
	jest.useRealTimers();
} );

describe( 'useCreateZendeskConversation — Smooch-not-ready retry loop', () => {
	it( 'retries the two transient "not ready" errors and succeeds once the SDK is ready', async () => {
		smoochCreateConversation
			.mockRejectedValueOnce( notReadyError() )
			.mockRejectedValueOnce(
				new Error( 'Must initialize the Web Messenger first using `init()`.' )
			)
			.mockResolvedValueOnce( { id: 'conv-1', metadata: {} } );

		const { result } = renderHook( () => useCreateZendeskConversation() );

		const promise = result.current( { createdFrom: 'automatic_escalation' } );

		// Two backoff intervals of 250ms drive the two retries.
		await jest.advanceTimersByTimeAsync( 250 );
		await jest.advanceTimersByTimeAsync( 250 );

		await expect( promise ).resolves.toBe( 'conv-1' );
		expect( smoochCreateConversation ).toHaveBeenCalledTimes( 3 );

		const success = lastTrackedProps( 'new_zendesk_conversation' );
		expect( success ).toMatchObject( { smooch_attempts: 3, smooch_waited_ms: 500 } );
	} );

	it( 'succeeds on the first attempt without waiting', async () => {
		smoochCreateConversation.mockResolvedValueOnce( { id: 'conv-1', metadata: {} } );

		const { result } = renderHook( () => useCreateZendeskConversation() );

		await expect( result.current( { createdFrom: 'automatic_escalation' } ) ).resolves.toBe(
			'conv-1'
		);

		expect( smoochCreateConversation ).toHaveBeenCalledTimes( 1 );
		const success = lastTrackedProps( 'new_zendesk_conversation' );
		expect( success ).toMatchObject( { smooch_attempts: 1, smooch_waited_ms: 0 } );
	} );

	it( 'surfaces the error after the 10s deadline if the SDK never becomes ready', async () => {
		smoochCreateConversation.mockRejectedValue( notReadyError() );

		const { result } = renderHook( () => useCreateZendeskConversation() );

		const promise = result.current( { createdFrom: 'automatic_escalation' } );

		// Past the 10s cap; the loop stops scheduling further retries.
		await jest.advanceTimersByTimeAsync( 10_500 );

		await expect( promise ).resolves.toBeUndefined();

		const error = lastTrackedProps( 'error_creating_zendesk_conversation' );
		expect( error ).toBeDefined();
		// ~40 backoffs of 250ms fit inside the 10s window.
		expect( error.smooch_attempts ).toBeGreaterThan( 1 );
		expect( error.smooch_waited_ms ).toBeLessThanOrEqual( 10_000 );
		// The user is shown the try-again message.
		expect( mockSetChat ).toHaveBeenCalled();
	} );

	it( 'duplicates the critical user fields as ticket-field metadata on the conversation', async () => {
		smoochCreateConversation.mockResolvedValueOnce( { id: 'conv-1', metadata: {} } );

		const { result } = renderHook( () => useCreateZendeskConversation() );

		await expect( result.current( { createdFrom: 'automatic_escalation' } ) ).resolves.toBe(
			'conv-1'
		);

		const {
			ZENDESK_CUSTOM_FIELD_AI_CHAT_ID,
			ZENDESK_CUSTOM_FIELD_WEBSITE_URL,
			ZENDESK_SOURCE_URL_TICKET_FIELD_ID,
		} = jest.requireMock( '@automattic/zendesk-client' );

		expect( smoochCreateConversation ).toHaveBeenCalledWith( {
			metadata: expect.objectContaining( {
				supportInteractionId: 'int-1',
				odieChatId: 'odie-1',
				[ `zen:ticket_field:${ ZENDESK_CUSTOM_FIELD_WEBSITE_URL }` ]: 'https://example.com',
				[ `zen:ticket_field:${ ZENDESK_SOURCE_URL_TICKET_FIELD_ID }` ]: window.location.href,
				[ `zen:ticket_field:${ ZENDESK_CUSTOM_FIELD_AI_CHAT_ID }` ]: 'odie-1',
			} ),
		} );
	} );

	it( 'does not retry a non-transient error', async () => {
		smoochCreateConversation.mockRejectedValueOnce( new Error( 'TypeError: Failed to fetch' ) );

		const { result } = renderHook( () => useCreateZendeskConversation() );

		await expect(
			result.current( { createdFrom: 'automatic_escalation' } )
		).resolves.toBeUndefined();

		expect( smoochCreateConversation ).toHaveBeenCalledTimes( 1 );
		const error = lastTrackedProps( 'error_creating_zendesk_conversation' );
		expect( error ).toMatchObject( { smooch_attempts: 1, smooch_waited_ms: 0 } );
	} );
} );

describe( 'useCreateZendeskConversation — transfer messages', () => {
	// Runs the chat update the hook queued once the conversation exists.
	const applyChatUpdate = ( prevChat: { odieId: string | null } ) => {
		const update = mockSetChat.mock.calls.at( -1 )?.[ 0 ];
		return update( { ...prevChat, messages: [] } );
	};

	beforeEach( () => {
		smoochCreateConversation.mockResolvedValueOnce( { id: 'conv-1', metadata: {} } );
	} );

	it( 'refers back to the Odie chat after a handoff', async () => {
		const { result } = renderHook( () => useCreateZendeskConversation() );
		await result.current( { createdFrom: 'automatic_escalation' } );

		applyChatUpdate( { odieId: 'odie-1' } );

		expect( mockGetOdieTransferMessages ).toHaveBeenCalledWith( expect.any( Function ), false );
	} );

	it( 'uses the direct copy when the user went straight to a human', async () => {
		const { result } = renderHook( () => useCreateZendeskConversation() );
		await result.current( { createdFrom: 'direct_url' } );

		applyChatUpdate( { odieId: null } );

		expect( mockGetOdieTransferMessages ).toHaveBeenCalledWith( expect.any( Function ), true );
	} );
} );

describe( 'useCreateZendeskConversation — conversation tags', () => {
	beforeEach( () => {
		smoochCreateConversation.mockResolvedValueOnce( { id: 'conv-1', metadata: {} } );
	} );

	it( 'writes the configured tags on the conversation', async () => {
		const context = ( useOdieAssistantContext as jest.Mock )();
		( useOdieAssistantContext as jest.Mock ).mockReturnValue( {
			...context,
			zendeskConversationTags: [ 'woo_support_flow_help_center', 'second_tag' ],
		} );

		const { result } = renderHook( () => useCreateZendeskConversation() );
		await result.current( { createdFrom: 'automatic_escalation' } );

		expect( smoochCreateConversation ).toHaveBeenCalledWith( {
			metadata: expect.objectContaining( {
				'zen:ticket:tags': 'woo_support_flow_help_center,second_tag',
			} ),
		} );
	} );

	it.each( [ 'control', 'human_only', 'hybrid' ] )(
		'tags a chat from the checkout support experiment with its %s variation',
		async ( variation ) => {
			const context = ( useOdieAssistantContext as jest.Mock )();
			( useOdieAssistantContext as jest.Mock ).mockReturnValue( {
				...context,
				checkoutSupportVariation: variation,
			} );

			const { result } = renderHook( () => useCreateZendeskConversation() );
			await result.current( { createdFrom: 'direct_url' } );

			expect( smoochCreateConversation ).toHaveBeenCalledWith( {
				metadata: expect.objectContaining( {
					'zen:ticket:tags': `wpcom_checkout_chat,wpcom_checkout_chat_${ variation }`,
				} ),
			} );
		}
	);

	it( 'keeps the configured tags next to the checkout support tags', async () => {
		const context = ( useOdieAssistantContext as jest.Mock )();
		( useOdieAssistantContext as jest.Mock ).mockReturnValue( {
			...context,
			zendeskConversationTags: [ 'woo_support_flow_help_center' ],
			checkoutSupportVariation: 'hybrid',
		} );

		const { result } = renderHook( () => useCreateZendeskConversation() );
		await result.current( { createdFrom: 'automatic_escalation' } );

		expect( smoochCreateConversation ).toHaveBeenCalledWith( {
			metadata: expect.objectContaining( {
				'zen:ticket:tags':
					'woo_support_flow_help_center,wpcom_checkout_chat,wpcom_checkout_chat_hybrid',
			} ),
		} );
	} );

	it( 'writes no tags when none are configured', async () => {
		const { result } = renderHook( () => useCreateZendeskConversation() );
		await result.current( { createdFrom: 'automatic_escalation' } );

		expect( smoochCreateConversation.mock.calls[ 0 ][ 0 ].metadata ).not.toHaveProperty(
			'zen:ticket:tags'
		);
	} );
} );

describe( 'useCreateZendeskConversation — what the host knows about the request', () => {
	const websiteField = 'zen:ticket_field:22054927';

	beforeEach( () => {
		smoochCreateConversation.mockResolvedValueOnce( { id: 'conv-1', metadata: {} } );
	} );

	it( 'uses the given site as the Site URL', async () => {
		const { result } = renderHook( () => useCreateZendeskConversation() );
		await result.current( {
			createdFrom: 'automatic_escalation',
			siteUrl: 'https://store.example',
		} );

		expect( smoochCreateConversation.mock.calls[ 0 ][ 0 ].metadata[ websiteField ] ).toBe(
			'https://store.example'
		);
		expect( mockSubmitUserFields ).toHaveBeenCalledWith(
			expect.objectContaining( { messaging_url: 'https://store.example' } )
		);
	} );

	it( 'keeps the selected site without one', async () => {
		const { result } = renderHook( () => useCreateZendeskConversation() );
		await result.current( { createdFrom: 'automatic_escalation' } );

		expect( smoochCreateConversation.mock.calls[ 0 ][ 0 ].metadata[ websiteField ] ).toBe(
			'https://example.com'
		);
	} );

	it( 'adds the given ticket fields', async () => {
		const { result } = renderHook( () => useCreateZendeskConversation() );
		await result.current( {
			createdFrom: 'automatic_escalation',
			ticketFields: { 25254766: 'woocommerce_subscriptions', 999: '' },
		} );

		const { metadata } = smoochCreateConversation.mock.calls[ 0 ][ 0 ];
		expect( metadata ).toMatchObject( {
			'zen:ticket_field:25254766': 'woocommerce_subscriptions',
		} );
		expect( metadata ).not.toHaveProperty( 'zen:ticket_field:999' );
	} );

	it( "adds the given tags to the product's tags", async () => {
		const context = ( useOdieAssistantContext as jest.Mock )();
		( useOdieAssistantContext as jest.Mock ).mockReturnValue( {
			...context,
			zendeskConversationTags: [ 'woo_support_flow_help_center' ],
		} );

		const { result } = renderHook( () => useCreateZendeskConversation() );
		await result.current( {
			createdFrom: 'automatic_escalation',
			tags: [ 'is_emergency', 'woo_support_flow_help_center' ],
		} );

		expect( smoochCreateConversation.mock.calls[ 0 ][ 0 ].metadata[ 'zen:ticket:tags' ] ).toBe(
			'woo_support_flow_help_center,is_emergency'
		);
	} );
} );
