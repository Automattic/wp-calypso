import { imageSizeFromAttachments } from '../image-size-from-attachments';

describe( 'imageSizeFromAttachments', () => {
	// Post attachments are stored as an object map keyed by attachment ID.
	const post = {
		attachments: {
			1234: { URL: 'https://example.com/a.jpg', width: 10, height: 20 },
			5678: { URL: 'https://example.com/b.jpg', width: 30, height: 40 },
		},
	};

	it( 'returns the size of the attachment matching the image URL', () => {
		expect( imageSizeFromAttachments( post, 'https://example.com/b.jpg' ) ).toEqual( {
			width: 30,
			height: 40,
		} );
	} );

	it( 'returns undefined when no attachment matches', () => {
		expect( imageSizeFromAttachments( post, 'https://example.com/missing.jpg' ) ).toBeUndefined();
	} );

	it( 'returns undefined when the post has no attachments', () => {
		expect( imageSizeFromAttachments( {}, 'https://example.com/a.jpg' ) ).toBeUndefined();
	} );
} );
