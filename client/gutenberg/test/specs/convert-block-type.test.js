/**
 * Internal dependencies
 */
import {
	getEditedPostContent,
	newPost,
	insertBlock,
	convertBlock,
} from '../support/utils';

describe( 'Code block', () => {
	beforeEach( async () => {
		await newPost();
	} );

	it( 'should convert to a preformatted block', async () => {
		const code = 'print "Hello Dolly!"';

		await insertBlock( 'Code' );

		await page.type( '.editor-block-list__block textarea', code );

		// Verify the content starts out as a Code block.
		const originalPostContent = await getEditedPostContent();
		expect( originalPostContent ).toMatchSnapshot();

		await convertBlock( 'Preformatted' );

		// The content should now be a Preformatted block with no data loss.
		const convertedPostContent = await getEditedPostContent();
		expect( convertedPostContent ).toMatchSnapshot();
	} );
} );
