/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Smooch from 'smooch';
import { useManagedZendeskChat } from '../src/use-managed-zendesk-chat';

jest.mock(
	'@automattic/agenttic-ui',
	() => ( {
		ThinkingMessage: () => null,
		ThumbsDownIcon: () => null,
		ThumbsUpIcon: () => null,
	} ),
	{ virtual: true }
);

const mockConversation = {
	id: 'conversation-1',
	lastUpdatedAt: 1,
	businessLastRead: 1,
	description: '',
	displayName: '',
	iconUrl: '',
	type: 'sdkGroup',
	participants: [],
	messages: [],
	metadata: {},
};

jest.mock( 'smooch', () => ( {
	__esModule: true,
	default: {
		render: jest.fn(),
		init: jest.fn(),
		createConversation: jest.fn(),
		getConversationById: jest.fn(),
		loadConversation: jest.fn(),
		on: jest.fn(),
		off: jest.fn(),
	},
} ) );

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	isRTL: () => false,
} ) );

jest.mock( '../src/components/csat-form', () => ( {
	CSATForm: () => null,
} ) );

jest.mock( '../src/use-authenticate-zendesk-messaging', () => ( {
	useAuthenticateZendeskMessaging: () => ( {
		data: { jwt: 'jwt', externalId: 'external-id' },
		isFetching: false,
	} ),
	fetchMessagingAuth: jest.fn(),
} ) );

jest.mock( '../src/use-attach-file', () => ( {
	useAttachFileToConversation: () => ( {
		isPending: false,
		mutateAsync: jest.fn(),
	} ),
} ) );

jest.mock( '../src/use-connection-status-notice', () => ( {
	useConnectionStatusNotice: () => undefined,
} ) );

jest.mock( '../src/util', () => ( {
	SUPPORTED_IMAGE_TYPES: [ 'image/jpeg', 'image/jpg', 'image/png', 'image/gif' ],
	MAX_ATTACHMENTS: 5,
	convertZendeskMessageToAgentticFormat: jest.fn( ( message ) => ( {
		id: message.id,
		role: message.role,
		content: [],
		timestamp: message.received,
		archived: false,
		disabled: false,
	} ) ),
	getSmoochContainer: () => globalThis.document.createElement( 'div' ),
	isSupportedImageType: ( type: string ) =>
		[ 'image/jpeg', 'image/jpg', 'image/png', 'image/gif' ].includes( type ),
	isTestModeEnvironment: () => false,
	playNotificationSound: jest.fn(),
} ) );

const smooch = Smooch as unknown as {
	init: jest.Mock;
	createConversation: jest.Mock;
	getConversationById: jest.Mock;
	loadConversation: jest.Mock;
};

function renderUseManagedZendeskChat( {
	conversationId,
	conversationTags = [],
	conversationTicketFields,
	startedFromAiChatId,
	startedFromChatSessionId,
	startedFromMessageId,
}: {
	conversationId?: string;
	conversationTags?: string[];
	conversationTicketFields?: Record<
		string | number,
		string | number | boolean | null | undefined
	>;
	startedFromAiChatId?: number;
	startedFromChatSessionId?: string;
	startedFromMessageId?: string;
} ) {
	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: { retry: false },
		},
	} );

	const initialEntry = {
		pathname: '/zendesk',
		state: conversationId
			? { conversationId }
			: {
					startedFromAiChatId,
					startedFromChatSessionId,
					startedFromMessageId,
			  },
	};

	return renderHook(
		() => useManagedZendeskChat( { conversationTags, conversationTicketFields } ),
		{
			wrapper: ( { children } ) => (
				<QueryClientProvider client={ queryClient }>
					<MemoryRouter initialEntries={ [ initialEntry ] }>{ children }</MemoryRouter>
				</QueryClientProvider>
			),
		}
	);
}

describe( 'useManagedZendeskChat', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		smooch.init.mockResolvedValue( undefined );
		smooch.createConversation.mockResolvedValue( mockConversation );
		smooch.getConversationById.mockResolvedValue( mockConversation );
	} );

	it( 'passes the conversation tags as metadata when creating a new conversation', async () => {
		renderUseManagedZendeskChat( {
			conversationTags: [ 'woo_support_flow_ai_plugin' ],
		} );

		await waitFor( () => expect( smooch.createConversation ).toHaveBeenCalled() );

		expect( smooch.createConversation ).toHaveBeenCalledWith(
			expect.objectContaining( {
				metadata: expect.objectContaining( {
					'zen:ticket:tags': 'woo_support_flow_ai_plugin',
				} ),
			} )
		);
	} );

	it( 'passes ticket fields as metadata when creating a new conversation', async () => {
		renderUseManagedZendeskChat( {
			conversationTicketFields: {
				22054927: 'https://example.com',
				25254766: 'woocommerce_core_product',
			},
			startedFromAiChatId: 5587242,
			startedFromChatSessionId: 'session-123',
			startedFromMessageId: 'message-123',
		} );

		await waitFor( () => expect( smooch.createConversation ).toHaveBeenCalled() );

		expect( smooch.createConversation ).toHaveBeenCalledWith(
			expect.objectContaining( {
				metadata: expect.objectContaining( {
					'zen:ticket_field:22054927': 'https://example.com',
					'zen:ticket_field:25254766': 'woocommerce_core_product',
					'zen:ticket_field:48091595802388': 'message-123',
					'zen:ticket_field:33538949515668': '5587242',
					chat_session_id: 'session-123',
					message_id: 'message-123',
				} ),
			} )
		);
	} );

	it( 'does not pass the AI chat ticket field when no numeric AI chat id is available', async () => {
		renderUseManagedZendeskChat( {
			conversationTicketFields: {
				22054927: 'https://example.com',
			},
			startedFromChatSessionId: 'session-123',
			startedFromMessageId: 'message-123',
		} );

		await waitFor( () => expect( smooch.createConversation ).toHaveBeenCalled() );

		expect( smooch.createConversation ).toHaveBeenCalledWith(
			expect.objectContaining( {
				metadata: expect.not.objectContaining( {
					'zen:ticket_field:33538949515668': expect.anything(),
				} ),
			} )
		);
		expect( smooch.createConversation ).toHaveBeenCalledWith(
			expect.objectContaining( {
				metadata: expect.objectContaining( {
					chat_session_id: 'session-123',
				} ),
			} )
		);
	} );

	it( 'does not set new conversation tags when loading an existing conversation', async () => {
		renderUseManagedZendeskChat( {
			conversationId: 'conversation-1',
			conversationTags: [ 'woo_support_flow_ai_plugin' ],
		} );

		await waitFor( () =>
			expect( smooch.getConversationById ).toHaveBeenCalledWith( 'conversation-1' )
		);

		expect( smooch.createConversation ).not.toHaveBeenCalled();
	} );
} );
