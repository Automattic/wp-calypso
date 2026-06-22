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

let mockIsMessagingScriptLoaded = true;

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

jest.mock( '../src/use-load-zendesk-messaging', () => ( {
	useLoadZendeskMessaging: () => ( {
		isMessagingScriptLoaded: mockIsMessagingScriptLoaded,
	} ),
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
}: {
	conversationId?: string;
	conversationTags?: string[];
} ) {
	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: { retry: false },
		},
	} );

	const initialEntry = {
		pathname: '/zendesk',
		state: conversationId ? { conversationId } : undefined,
	};

	return renderHook( () => useManagedZendeskChat( { conversationTags } ), {
		wrapper: ( { children } ) => (
			<QueryClientProvider client={ queryClient }>
				<MemoryRouter initialEntries={ [ initialEntry ] }>{ children }</MemoryRouter>
			</QueryClientProvider>
		),
	} );
}

describe( 'useManagedZendeskChat', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsMessagingScriptLoaded = true;
		( window as Window & { zE?: jest.Mock } ).zE = jest.fn();
		smooch.init.mockResolvedValue( undefined );
		smooch.createConversation.mockResolvedValue( mockConversation );
		smooch.getConversationById.mockResolvedValue( mockConversation );
	} );

	it( 'sets Zendesk conversation tags before creating a new conversation', async () => {
		renderUseManagedZendeskChat( {
			conversationTags: [ 'woo_support_flow_ai_plugin' ],
		} );

		await waitFor( () => expect( smooch.createConversation ).toHaveBeenCalled() );

		expect( ( window as Window & { zE?: jest.Mock } ).zE ).toHaveBeenCalledWith(
			'messenger:set',
			'conversationTags',
			[ 'woo_support_flow_ai_plugin' ]
		);
		expect(
			( window as Window & { zE?: jest.Mock } ).zE?.mock.invocationCallOrder[ 0 ]
		).toBeLessThan( smooch.createConversation.mock.invocationCallOrder[ 0 ] );
	} );

	it( 'waits for Zendesk Messenger before creating a tagged conversation', async () => {
		mockIsMessagingScriptLoaded = false;

		renderUseManagedZendeskChat( {
			conversationTags: [ 'woo_support_flow_ai_plugin' ],
		} );

		await waitFor( () => expect( smooch.init ).toHaveBeenCalled() );

		expect( ( window as Window & { zE?: jest.Mock } ).zE ).not.toHaveBeenCalled();
		expect( smooch.createConversation ).not.toHaveBeenCalled();
	} );

	it( 'does not set new conversation tags when loading an existing conversation', async () => {
		renderUseManagedZendeskChat( {
			conversationId: 'conversation-1',
			conversationTags: [ 'woo_support_flow_ai_plugin' ],
		} );

		await waitFor( () =>
			expect( smooch.getConversationById ).toHaveBeenCalledWith( 'conversation-1' )
		);

		expect( ( window as Window & { zE?: jest.Mock } ).zE ).not.toHaveBeenCalledWith(
			'messenger:set',
			'conversationTags',
			expect.anything()
		);
		expect( smooch.createConversation ).not.toHaveBeenCalled();
	} );
} );
