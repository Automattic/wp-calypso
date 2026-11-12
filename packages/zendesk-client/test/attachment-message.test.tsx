/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { AttachmentMessage } from '../src/components/attachment-message';

describe( 'AttachmentMessage', () => {
	it( 'decodes the file name it takes from the media URL', () => {
		render(
			<AttachmentMessage
				type="file"
				mediaUrl="https://example.zendesk.com/attachments/import-export-suite-for-woocommerce%20(4).zip?token=abc"
			/>
		);

		expect( screen.getByRole( 'link' ) ).toHaveTextContent(
			'import-export-suite-for-woocommerce (4).zip'
		);
	} );

	it( 'shows the name as it is in the media URL when it cannot be decoded', () => {
		render(
			<AttachmentMessage type="file" mediaUrl="https://example.zendesk.com/attachments/100%.zip" />
		);

		expect( screen.getByRole( 'link' ) ).toHaveTextContent( '100%.zip' );
	} );

	it( 'prefers the alt text over the name in the media URL', () => {
		render(
			<AttachmentMessage
				type="file"
				altText="report.pdf"
				mediaUrl="https://example.zendesk.com/attachments/1f0e%20.pdf"
			/>
		);

		expect( screen.getByRole( 'link' ) ).toHaveTextContent( 'report.pdf' );
	} );
} );
