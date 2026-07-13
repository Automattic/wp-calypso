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
	useUpdateZendeskUserFields: () => ( {
		isPending: false,
		mutateAsync: mockSubmitUserFields,
	} ),
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
	getOdieTransferMessages: () => [],
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
