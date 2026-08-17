/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Smooch from 'smooch';
import { fetchMessagingAuth } from '../src/use-authenticate-zendesk-messaging';
import { useGetZendeskConversations, useManagedZendeskChat } from '../src/use-managed-zendesk-chat';

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
		getConversations: jest.fn( () => [] ),
		loadConversation: jest.fn(),
		on: jest.fn(),
		off: jest.fn(),
	},
} ) );

jest.mock( '@automattic/calypso-analytics', () => ( {
	...jest.requireActual( '@automattic/calypso-analytics' ),
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
	isCsatTriggerMessage: ( message: { metadata?: { type?: string } } ) =>
		message?.metadata?.type === 'csat',
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

type SmoochInitOptions = { delegate: { onInvalidAuth: () => Promise< string > } };

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

	describe( 'site context on Smooch auth errors', () => {
		// Smooch is a singleton, so the site must survive whichever hook installs the auth
		// delegate and whichever one unmounts later.
		function makeWrapper() {
			const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
			return ( { children }: { children: React.ReactNode } ) => (
				<QueryClientProvider client={ queryClient }>
					<MemoryRouter initialEntries={ [ { pathname: '/zendesk', state: {} } ] }>
						{ children }
					</MemoryRouter>
				</QueryClientProvider>
			);
		}

		async function triggerAuthError() {
			( fetchMessagingAuth as jest.Mock ).mockResolvedValue( { jwt: 'refreshed-jwt' } );
			const { delegate } = smooch.init.mock.calls[ 0 ][ 0 ] as SmoochInitOptions;
			await delegate.onInvalidAuth();
		}

		it( 'reports the chat site when the conversation list initialised Smooch first', async () => {
			const wrapper = makeWrapper();

			renderHook( () => useGetZendeskConversations( true ), { wrapper } );
			await waitFor( () => expect( smooch.init ).toHaveBeenCalled() );

			renderHook( () => useManagedZendeskChat( { siteId: 123 } ), { wrapper } );
			await waitFor( () => expect( smooch.createConversation ).toHaveBeenCalled() );

			await triggerAuthError();

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_smooch_messenger_auth_error', {
				blog_id: 123,
				site_context_source: 'chat_site',
			} );
		} );

		it( 'reports the site when the conversation list is the only Smooch owner', async () => {
			const wrapper = makeWrapper();

			renderHook( () => useGetZendeskConversations( true, undefined, 456 ), { wrapper } );
			await waitFor( () => expect( smooch.init ).toHaveBeenCalled() );

			await triggerAuthError();

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_smooch_messenger_auth_error', {
				blog_id: 456,
				site_context_source: 'chat_site',
			} );
		} );

		it( 'keeps the remaining owner site after another owner unmounts', async () => {
			const wrapper = makeWrapper();

			const list = renderHook( () => useGetZendeskConversations( true, undefined, 456 ), {
				wrapper,
			} );
			await waitFor( () => expect( smooch.init ).toHaveBeenCalled() );

			const chat = renderHook( () => useManagedZendeskChat( { siteId: 456 } ), { wrapper } );
			await waitFor( () => expect( smooch.createConversation ).toHaveBeenCalled() );
			chat.unmount();

			await triggerAuthError();

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_smooch_messenger_auth_error', {
				blog_id: 456,
				site_context_source: 'chat_site',
			} );

			list.unmount();
		} );

		it( 'keeps a valid owner site when another owner has an unusable one', async () => {
			const wrapper = makeWrapper();

			const list = renderHook( () => useGetZendeskConversations( true, undefined, 456 ), {
				wrapper,
			} );
			await waitFor( () => expect( smooch.init ).toHaveBeenCalled() );

			renderHook( () => useManagedZendeskChat( { siteId: 0 } ), { wrapper } );
			await waitFor( () => expect( smooch.createConversation ).toHaveBeenCalled() );

			await triggerAuthError();

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_smooch_messenger_auth_error', {
				blog_id: 456,
				site_context_source: 'chat_site',
			} );

			list.unmount();
		} );

		it( 'omits the site once every owner has unmounted', async () => {
			const wrapper = makeWrapper();

			const list = renderHook( () => useGetZendeskConversations( true, undefined, 456 ), {
				wrapper,
			} );
			await waitFor( () => expect( smooch.init ).toHaveBeenCalled() );
			list.unmount();

			await triggerAuthError();

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_smooch_messenger_auth_error', {
				site_context_source: 'none',
			} );
		} );
	} );
} );
