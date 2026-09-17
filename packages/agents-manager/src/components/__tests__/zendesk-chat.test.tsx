/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- mocks must be registered before importing ZendeskChat */
import { render } from '@testing-library/react';

const mockUseManagedZendeskChat = jest.fn();
let mockZendeskTicketProductFieldValue: string | undefined = 'woocommerce_core_product';

jest.mock( '@automattic/zendesk-client', () => ( {
	useManagedZendeskChat: ( props: unknown ) => mockUseManagedZendeskChat( props ),
	ZENDESK_CUSTOM_FIELD_PRODUCT: 25254766,
	ZENDESK_CUSTOM_FIELD_WEBSITE_URL: 22054927,
	ZENDESK_SOURCE_URL_TICKET_FIELD_ID: 23752099174548,
} ) );

jest.mock( '../../contexts', () => ( {
	useAgentsManagerContext: () => ( {
		site: { ID: 123, URL: 'https://example.com' },
		zendeskConversationTags: [ 'woo_support_flow_ai_plugin' ],
		zendeskSmoochIntegrationKey: 'woo',
		zendeskTicketProductFieldValue: mockZendeskTicketProductFieldValue,
	} ),
} ) );

jest.mock( '../agent-chat', () => ( {
	__esModule: true,
	default: () => <div data-testid="agent-chat" />,
} ) );

jest.mock( '../concluded-conversation-footer', () => ( {
	__esModule: true,
	default: () => null,
} ) );

import ZendeskChat from '../zendesk-chat';

describe( 'ZendeskChat', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockZendeskTicketProductFieldValue = 'woocommerce_core_product';
		mockUseManagedZendeskChat.mockReturnValue( {
			agentticMessages: [],
			onSubmit: jest.fn(),
			isLoadingConversation: false,
			isProcessing: false,
			onTypingStatusChange: jest.fn(),
			imageUpload: undefined,
			supportedImageTypes: [],
			notice: undefined,
			hasInteractionEnded: false,
		} );
	} );

	it( 'passes Woo AI ticket fields through conversation metadata', () => {
		render(
			<ZendeskChat
				chatHeaderOptions={ [] }
				isDocked={ false }
				isOpen
				onClose={ jest.fn() }
				onExpand={ jest.fn() }
			/>
		);

		expect( mockUseManagedZendeskChat ).toHaveBeenCalledWith(
			expect.objectContaining( {
				conversationTags: [ 'woo_support_flow_ai_plugin' ],
				smoochIntegrationKey: 'woo',
				conversationTicketFields: expect.objectContaining( {
					22054927: 'https://example.com',
					23752099174548: window.location.href,
					25254766: 'woocommerce_core_product',
				} ),
			} )
		);
	} );

	it( 'does not pass Woo ticket fields when no product field value is configured', () => {
		mockZendeskTicketProductFieldValue = undefined;

		render(
			<ZendeskChat
				chatHeaderOptions={ [] }
				isDocked={ false }
				isOpen
				onClose={ jest.fn() }
				onExpand={ jest.fn() }
			/>
		);

		expect( mockUseManagedZendeskChat ).toHaveBeenCalledWith(
			expect.objectContaining( {
				conversationTicketFields: {},
			} )
		);
	} );
} );
