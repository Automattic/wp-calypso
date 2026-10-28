/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { useOdieAssistantContext } from '../../../context';
import { useAttachmentHandler } from '../use-attachment-handler';

const mockAddMessage = jest.fn();
const mockAttachFileToConversation = jest.fn().mockResolvedValue( undefined );
const mockTrackEvent = jest.fn();
// Arguments: whether the token may be fetched, and the token type.
const mockUseAuthenticateZendeskMessaging = jest.fn< object, [ boolean, string ] >( () => ( {
	data: { token: 'token' },
} ) );

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
		useAuthenticateZendeskMessaging: ( enabled: boolean, type: string ) =>
			mockUseAuthenticateZendeskMessaging( enabled, type ),
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

describe( 'useAttachmentHandler – attach button', () => {
	const openPicker = ( onClick: () => void ) => {
		const click = jest
			.spyOn( HTMLInputElement.prototype, 'click' )
			.mockImplementation( () => undefined );
		onClick();
		click.mockRestore();
		return document.body.querySelector< HTMLInputElement >( 'input[type="file"]' );
	};

	it( 'keeps the file input in the document until a file is picked', async () => {
		const { result } = renderHook( () => useAttachmentHandler() );
		const input = openPicker( result.current.attachmentAction.onClick );

		expect( input ).not.toBeNull();

		const file = new File( [ 'jpeg' ], 'image.jpg', { type: 'image/jpeg' } );
		Object.defineProperty( input, 'files', { value: [ file ] } );
		await act( async () => input!.dispatchEvent( new Event( 'change' ) ) );

		expect( document.body.contains( input ) ).toBe( false );
		expect( getPreviewFiles( result.current.attachmentPreviews ) ).toEqual( [ file ] );
	} );

	it( 'removes the file input when the picker is cancelled', () => {
		const { result } = renderHook( () => useAttachmentHandler() );
		const input = openPicker( result.current.attachmentAction.onClick );

		input!.dispatchEvent( new Event( 'cancel' ) );

		expect( document.body.contains( input ) ).toBe( false );
	} );
} );

describe( 'useAttachmentHandler – chat token', () => {
	const withContext = ( overrides: Record< string, unknown > ) =>
		( useOdieAssistantContext as jest.Mock ).mockReturnValue( {
			...( useOdieAssistantContext as jest.Mock )(),
			...overrides,
		} );

	it( 'requests the token for a user without paid support who has an open human chat', () => {
		withContext( { isUserEligibleForPaidSupport: false, hasOpenZendeskChat: true } );

		renderHook( () => useAttachmentHandler() );

		expect( mockUseAuthenticateZendeskMessaging ).toHaveBeenLastCalledWith( true, 'messenger' );
	} );

	it( 'does not request it for a user without paid support or an open human chat', () => {
		withContext( { isUserEligibleForPaidSupport: false, hasOpenZendeskChat: false } );

		renderHook( () => useAttachmentHandler() );

		expect( mockUseAuthenticateZendeskMessaging ).toHaveBeenLastCalledWith( false, 'messenger' );
	} );
} );

describe( 'useAttachmentHandler – messaging integration', () => {
	it( "uploads files on the chat's messaging integration", async () => {
		( useOdieAssistantContext as jest.Mock ).mockReturnValue( {
			...( useOdieAssistantContext as jest.Mock )(),
			zendeskIntegrationKey: 'woo',
		} );
		const { result } = renderHook( () => useAttachmentHandler() );
		const file = new File( [ 'status' ], 'system-status.txt', { type: 'text/plain' } );

		await act( async () => result.current.handleFileUpload( [ file ] ) );
		await act( async () => result.current.sendAttachments() );

		await waitFor( () => {
			expect( mockAttachFileToConversation ).toHaveBeenCalledWith(
				expect.objectContaining( { file, integrationKey: 'woo' } )
			);
		} );
	} );
} );
