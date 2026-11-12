/**
 * @jest-environment jsdom
 */
import { zendeskMessageConverter } from '../src/zendesk-message-converter';
import type { ZendeskMessage } from '../src/types';

jest.mock( '@automattic/calypso-config', () => jest.fn() );

jest.mock( '@automattic/data-stores', () => ( {
	isInSupportSession: jest.fn(),
} ) );

const mediaUrl =
	'https://example.zendesk.com/attachments/import-export-suite-for-woocommerce%20(4).zip';

const fileMessage = ( message: Partial< ZendeskMessage > ) =>
	( {
		id: 'message-1',
		role: 'user',
		type: 'file',
		text: '',
		received: 1794000000,
		mediaUrl,
		...message,
	} ) as ZendeskMessage;

describe( 'zendeskMessageConverter — file messages', () => {
	it( 'links the file name once when Zendesk sends it as the alt text', () => {
		const { content } = zendeskMessageConverter(
			fileMessage( { altText: 'import-export-suite-for-woocommerce (4).zip' } )
		);

		expect( content ).toBe( `[import-export-suite-for-woocommerce (4).zip](${ mediaUrl })` );
	} );

	it( 'decodes the file name it takes from the media URL when there is no alt text', () => {
		const { content } = zendeskMessageConverter( fileMessage( {} ) );

		expect( content ).toBe(
			`[Attachment import-export-suite-for-woocommerce (4).zip](${ mediaUrl })`
		);
	} );

	it( 'links the name as it is in the media URL when it cannot be decoded', () => {
		const malformedUrl = 'https://example.zendesk.com/attachments/100%.zip';
		const { content } = zendeskMessageConverter( fileMessage( { mediaUrl: malformedUrl } ) );

		expect( content ).toBe( `[Attachment 100%.zip](${ malformedUrl })` );
	} );
} );
