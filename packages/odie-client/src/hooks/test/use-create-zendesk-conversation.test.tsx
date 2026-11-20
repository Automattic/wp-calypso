import { renderHook } from '@testing-library/react';
import Smooch from 'smooch';
import { type Mock, vi } from 'vitest';
import { useOdieAssistantContext } from '../../context';
import { useCreateZendeskConversation } from '../use-create-zendesk-conversation';

/**
 * Mutable state backing the mocked dependencies. Each test mutates these in
 * `beforeEach` (or inline) to drive the hook through the scenario under test.
 */
const mockTrackEvent = vi.fn();
const mockSetChat = vi.fn();
const mockSubmitUserFields = vi.fn();
const mockRequestClassificationTags = vi.fn();
const mockAddEventToInteraction = vi.fn();
const mockStartNewInteraction = vi.fn();
const mockGetOdieTransferMessages = vi.fn().mockReturnValue( [] );
let mockHasReachedLimit = false;

vi.mock( 'smooch', () => ( {
	default: {
		createConversation: vi.fn(),
		updateConversation: vi.fn(),
		loadConversation: vi.fn(),
	},
} ) );

vi.mock( 'react-router-dom', () => ( {
	useLocation: () => ( { search: '', pathname: '/' } ),
	useNavigate: () => vi.fn(),
} ) );

vi.mock( '@automattic/zendesk-client', () => ( {
	requestClassificationTags: ( ...args: unknown[] ) => mockRequestClassificationTags( ...args ),
	useUpdateZendeskUserFields: () => ( {
		isPending: false,
		mutateAsync: mockSubmitUserFields,
	} ),
	ZENDESK_CUSTOM_FIELD_AI_CHAT_ID: 33538949515668,
	ZENDESK_CUSTOM_FIELD_WEBSITE_URL: 22054927,
	ZENDESK_SOURCE_URL_TICKET_FIELD_ID: 23752099174548,
} ) );

vi.mock( '../../context', () => ( {
	useOdieAssistantContext: vi.fn(),
} ) );

vi.mock( '../../data', () => ( {
	useManageSupportInteraction: () => ( {
		addEventToInteraction: mockAddEventToInteraction,
		startNewInteraction: mockStartNewInteraction,
	} ),
} ) );

vi.mock( '../../data/use-current-support-interaction', () => ( {
	useCurrentSupportInteraction: () => ( {
		data: { uuid: 'int-1', bot_slug: 'wpcom-support-chat' },
	} ),
} ) );

vi.mock( '../../utils/get-open-live-interactions', () => ( {
	getOpenLiveInteractions: () => ( { hasReachedLimit: mockHasReachedLimit } ),
} ) );

vi.mock( '../use-open-interaction-status-map', () => ( {
	useOpenInteractionStatusMap: () => ( {} ),
} ) );

vi.mock( '../../constants', () => ( {
	getErrorTryAgainLaterMessage: () => ( { content: 'try-again', role: 'bot', type: 'message' } ),
	getOdieTransferMessages: ( ...args: unknown[] ) => mockGetOdieTransferMessages( ...args ),
	getZendeskChatStartedMetaMessage: () => ( {
		content: 'chat-started',
		role: 'bot',
		type: 'message',
	} ),
} ) );

const smoochCreateConversation = Smooch.createConversation as Mock;

const notReadyError = () => new TypeError( 'i(...).createConversation is not a function' );

// Returns the props object of the most recent trackEvent call for `name`.
const lastTrackedProps = ( name: string ) =>
	mockTrackEvent.mock.calls.filter( ( [ event ] ) => event === name ).at( -1 )?.[ 1 ];

beforeEach( () => {
	vi.clearAllMocks();
	vi.useFakeTimers();
	mockHasReachedLimit = false;
	mockSubmitUserFields.mockResolvedValue( undefined );
	mockRequestClassificationTags.mockResolvedValue( [] );
	// activeInteractionId === interaction.uuid, so updateConversation is skipped.
	mockAddEventToInteraction.mockResolvedValue( { uuid: 'int-1' } );
	mockStartNewInteraction.mockResolvedValue( { uuid: 'int-1' } );
	( useOdieAssistantContext as Mock ).mockReturnValue( {
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
	vi.useRealTimers();
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
		await vi.advanceTimersByTimeAsync( 250 );
		await vi.advanceTimersByTimeAsync( 250 );

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
		await vi.advanceTimersByTimeAsync( 10_500 );

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
		} = await import( '@automattic/zendesk-client' );

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
		const context = ( useOdieAssistantContext as Mock )();
		( useOdieAssistantContext as Mock ).mockReturnValue( {
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
			const context = ( useOdieAssistantContext as Mock )();
			( useOdieAssistantContext as Mock ).mockReturnValue( {
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
		const context = ( useOdieAssistantContext as Mock )();
		( useOdieAssistantContext as Mock ).mockReturnValue( {
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

describe( 'useCreateZendeskConversation — classification tags', () => {
	beforeEach( () => {
		smoochCreateConversation.mockResolvedValueOnce( { id: 'conv-1', metadata: {} } );
	} );

	it( 'writes the classification tags next to the configured and checkout tags, each once', async () => {
		const context = ( useOdieAssistantContext as Mock )();
		( useOdieAssistantContext as Mock ).mockReturnValue( {
			...context,
			zendeskConversationTags: [ 'woo_support_flow_help_center', 'cl_classified' ],
			checkoutSupportVariation: 'hybrid',
		} );
		mockRequestClassificationTags.mockResolvedValue( [ 'cl_category_billing', 'cl_classified' ] );

		const { result } = renderHook( () => useCreateZendeskConversation() );
		await expect( result.current( { createdFrom: 'automatic_escalation' } ) ).resolves.toBe(
			'conv-1'
		);

		expect( mockRequestClassificationTags ).toHaveBeenCalledWith( 'odie-1' );
		expect( smoochCreateConversation ).toHaveBeenCalledWith( {
			metadata: expect.objectContaining( {
				'zen:ticket:tags':
					'woo_support_flow_help_center,cl_classified,cl_category_billing,wpcom_checkout_chat,wpcom_checkout_chat_hybrid',
			} ),
		} );
		expect( lastTrackedProps( 'new_zendesk_conversation' ) ).toMatchObject( {
			classification_tags_count: 2,
			classification_timed_out: false,
		} );
	} );

	it( 'requests the tags alongside the user fields, not after them', async () => {
		let resolveUserFields: () => void = () => {};
		mockSubmitUserFields.mockReturnValue(
			new Promise< void >( ( resolve ) => {
				resolveUserFields = resolve;
			} )
		);

		const { result } = renderHook( () => useCreateZendeskConversation() );
		const promise = result.current( { createdFrom: 'automatic_escalation' } );

		expect( mockRequestClassificationTags ).toHaveBeenCalledTimes( 1 );
		expect( mockSubmitUserFields ).toHaveBeenCalledTimes( 1 );

		resolveUserFields();
		await expect( promise ).resolves.toBe( 'conv-1' );
	} );

	it( 'creates the chat without classification tags once the time limit passes', async () => {
		mockRequestClassificationTags.mockReturnValue( new Promise( () => {} ) );

		const { result } = renderHook( () => useCreateZendeskConversation() );
		const promise = result.current( { createdFrom: 'automatic_escalation' } );

		await vi.advanceTimersByTimeAsync( 4999 );
		expect( smoochCreateConversation ).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync( 1 );
		await expect( promise ).resolves.toBe( 'conv-1' );

		expect( smoochCreateConversation.mock.calls[ 0 ][ 0 ].metadata ).not.toHaveProperty(
			'zen:ticket:tags'
		);
		expect( lastTrackedProps( 'new_zendesk_conversation' ) ).toMatchObject( {
			classification_tags_count: 0,
			classification_wait_ms: 5000,
			classification_timed_out: true,
		} );
	} );

	it( 'does not wait for the tags when the user fields fail', async () => {
		mockRequestClassificationTags.mockReturnValue( new Promise( () => {} ) );
		mockSubmitUserFields.mockRejectedValue( new Error( 'user fields failed' ) );

		const { result } = renderHook( () => useCreateZendeskConversation() );

		await expect(
			result.current( { createdFrom: 'automatic_escalation' } )
		).resolves.toBeUndefined();

		expect( smoochCreateConversation ).not.toHaveBeenCalled();
		expect( lastTrackedProps( 'error_submitting_zendesk_user_fields' ) ).toBeDefined();
		expect( vi.getTimerCount() ).toBe( 0 );
	} );

	it( 'makes no classification request without an Odie chat', async () => {
		const context = ( useOdieAssistantContext as Mock )();
		( useOdieAssistantContext as Mock ).mockReturnValue( {
			...context,
			chat: { ...context.chat, odieId: null },
		} );

		const { result } = renderHook( () => useCreateZendeskConversation() );
		await expect( result.current( { createdFrom: 'direct_url' } ) ).resolves.toBe( 'conv-1' );

		expect( mockRequestClassificationTags ).not.toHaveBeenCalled();
		expect( lastTrackedProps( 'new_zendesk_conversation' ) ).toMatchObject( {
			classification_tags_count: 0,
			classification_wait_ms: 0,
			classification_timed_out: false,
		} );
	} );
} );
