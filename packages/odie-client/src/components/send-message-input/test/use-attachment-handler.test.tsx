/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { useOdieAssistantContext } from '../../../context';
import { useAttachmentHandler } from '../use-attachment-handler';

const mockAddMessage = jest.fn();
const mockAttachFileToConversation = jest.fn().mockResolvedValue( undefined );
const mockTrackEvent = jest.fn();

jest.mock( '@wordpress/i18n', () => {
	Object.assign( globalThis, { __i18n_text_domain__: 'default' } );
	return { __: ( text: string ) => text };
} );

jest.mock( '@wordpress/components', () => ( {
	DropZone: () => null,
} ) );

jest.mock( '@wordpress/data', () => ( {
	useSelect: () => ( {
		zendeskClientId: 'zendesk-client-id',
		connectionStatus: 'connected',
	} ),
} ) );

jest.mock(
	'@automattic/zendesk-client',
	() => ( {
		useAttachFileToConversation: () => ( {
			isPending: false,
			mutateAsync: mockAttachFileToConversation,
		} ),
		useAuthenticateZendeskMessaging: () => ( { data: { token: 'token' } } ),
		zendeskMessageConverter: jest.fn( ( message ) => ( {
			...message,
			content: message.type === 'file-placeholder' ? `📎 ${ message.altText }` : '',
		} ) ),
	} ),
	{ virtual: true }
);

jest.mock( '../../../context', () => ( {
	useOdieAssistantContext: jest.fn(),
} ) );

jest.mock( '../../../constants', () => ( {
	HELP_CENTER_STORE: 'help-center',
} ) );

jest.mock( '../../attachment-preview', () => ( {
	AttachmentPreviews: () => null,
} ) );

beforeEach( () => {
	jest.clearAllMocks();
	Object.defineProperty( crypto, 'randomUUID', {
		configurable: true,
		value: jest.fn( () => 'temporary-id' ),
	} );
	Object.defineProperty( URL, 'createObjectURL', {
		configurable: true,
		value: jest.fn( () => 'blob:attachment' ),
	} );
	( useOdieAssistantContext as jest.Mock ).mockReturnValue( {
		trackEvent: mockTrackEvent,
		addMessage: mockAddMessage,
		isUserEligibleForPaidSupport: true,
		chat: {
			clientId: 'client-id',
			conversationId: 'conversation-id',
			provider: 'zendesk',
		},
	} );
} );

const getPreviewFiles = ( attachmentPreviews: React.ReactNode ) =>
	( attachmentPreviews as React.ReactElement< { attachmentPreviews: File[] } > ).props
		.attachmentPreviews;

describe( 'useAttachmentHandler', () => {
	it( 'accepts a text file without showing a bad-format notice', async () => {
		const { result } = renderHook( () => useAttachmentHandler() );
		const file = new File( [ 'status' ], 'system-status.txt', { type: 'text/plain' } );

		await act( async () => result.current.handleFileUpload( [ file ] ) );

		expect( getPreviewFiles( result.current.attachmentPreviews ) ).toEqual( [ file ] );
		expect( result.current.badFormatNotice ).toBeUndefined();
	} );

	it( 'accepts a log file with no MIME type by its extension', async () => {
		const { result } = renderHook( () => useAttachmentHandler() );
		const file = new File( [ 'status' ], 'system-status.log', { type: '' } );

		await act( async () => result.current.handleFileUpload( [ file ] ) );

		expect( getPreviewFiles( result.current.attachmentPreviews ) ).toEqual( [ file ] );
		expect( result.current.badFormatNotice ).toBeUndefined();
	} );

	it( 'rejects an unsupported file and shows a bad-format notice', async () => {
		const { result } = renderHook( () => useAttachmentHandler() );
		const file = new File( [ 'binary' ], 'program.exe', {
			type: 'application/x-msdownload',
		} );

		await act( async () => result.current.handleFileUpload( [ file ] ) );

		expect( result.current.attachmentPreviews ).toBeNull();
		expect( result.current.badFormatNotice ).toBeDefined();
	} );

	it( 'does not attach plain text from the clipboard', async () => {
		const getType = jest.fn();
		const read = jest.fn().mockResolvedValue( [
			{
				types: [ 'text/plain' ],
				getType,
			},
		] );
		Object.defineProperty( navigator, 'clipboard', {
			configurable: true,
			value: { read },
		} );
		const { result } = renderHook( () => useAttachmentHandler() );

		act( () => {
			result.current.handleImagePaste( {
				key: 'v',
				ctrlKey: true,
				metaKey: false,
			} as React.KeyboardEvent< HTMLTextAreaElement > );
		} );

		await waitFor( () => expect( read ).toHaveBeenCalled() );
		expect( getType ).not.toHaveBeenCalled();
		expect( result.current.attachmentPreviews ).toBeNull();
	} );

	it( 'creates a file placeholder containing the non-image filename', async () => {
		const { result } = renderHook( () => useAttachmentHandler() );
		const file = new File( [ 'status' ], 'system-status.txt', { type: 'text/plain' } );

		await act( async () => result.current.handleFileUpload( [ file ] ) );
		await act( async () => result.current.sendAttachments() );

		await waitFor( () => {
			expect( mockAddMessage ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: 'file-placeholder',
					altText: 'system-status.txt',
				} )
			);
		} );
	} );
} );
