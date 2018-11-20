/**
 * Internal dependencies
 */
import {
	clickBlockAppender,
	getEditedPostContent,
	newPost,
	pressTimes,
	convertBlock,
	insertBlock,
} from '../../support/utils';

describe( 'Quote', () => {
	beforeEach( async () => {
		await newPost();
	} );

	it( 'can be created by using > at the start of a paragraph block', async () => {
		// Create a block with some text that will trigger a list creation.
		await clickBlockAppender();
		await page.keyboard.type( '> A quote' );

		// Create a second list item.
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'Another paragraph' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'can be created by typing > in front of text of a paragraph block', async () => {
		// Create a list with the slash block shortcut.
		await clickBlockAppender();
		await page.keyboard.type( 'test' );
		await pressTimes( 'ArrowLeft', 4 );
		await page.keyboard.type( '> ' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'can be created by typing "/quote"', async () => {
		// Create a list with the slash block shortcut.
		await clickBlockAppender();
		await page.keyboard.type( '/quote' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'I’m a quote' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'can be created by converting a paragraph', async () => {
		await clickBlockAppender();
		await page.keyboard.type( 'test' );
		await convertBlock( 'Quote' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'can be created by converting multiple paragraphs', async () => {
		await clickBlockAppender();
		await page.keyboard.type( 'one' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'two' );
		await page.keyboard.down( 'Shift' );
		await page.click( '[data-type="core/paragraph"]' );
		await page.keyboard.up( 'Shift' );
		await convertBlock( 'Quote' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	describe( 'can be converted to paragraphs', async () => {
		it( 'and renders one paragraph block per <p> within quote', async () => {
			await insertBlock( 'Quote' );
			await page.keyboard.type( 'one' );
			await page.keyboard.press( 'Enter' );
			await page.keyboard.type( 'two' );
			await convertBlock( 'Paragraph' );

			expect( await getEditedPostContent() ).toMatchSnapshot();
		} );

		it( 'and renders a paragraph for the cite, if it exists', async () => {
			await insertBlock( 'Quote' );
			await page.keyboard.type( 'one' );
			await page.keyboard.press( 'Enter' );
			await page.keyboard.type( 'two' );
			await page.keyboard.press( 'Tab' );
			await page.keyboard.type( 'cite' );
			await convertBlock( 'Paragraph' );

			expect( await getEditedPostContent() ).toMatchSnapshot();
		} );

		it( 'and renders only one paragraph for the cite, if the quote is void', async () => {
			await insertBlock( 'Quote' );
			await page.keyboard.press( 'Tab' );
			await page.keyboard.type( 'cite' );
			await convertBlock( 'Paragraph' );

			expect( await getEditedPostContent() ).toMatchSnapshot();
		} );

		it( 'and renders a void paragraph if both the cite and quote are void', async () => {
			await insertBlock( 'Quote' );
			await convertBlock( 'Paragraph' );

			expect( await getEditedPostContent() ).toMatchSnapshot();
		} );
	} );

	it( 'can be created by converting a heading', async () => {
		await insertBlock( 'Heading' );
		await page.keyboard.type( 'test' );
		await convertBlock( 'Quote' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'can be converted to headings', async () => {
		await insertBlock( 'Quote' );
		await page.keyboard.type( 'one' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'two' );
		await page.keyboard.press( 'Tab' );
		await page.keyboard.type( 'cite' );
		await convertBlock( 'Heading' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
		await page.click( '[data-type="core/quote"]' );
		await convertBlock( 'Heading' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
		await page.click( '[data-type="core/quote"]' );
		await convertBlock( 'Heading' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'can be converted to a pullquote', async () => {
		await insertBlock( 'Quote' );
		await page.keyboard.type( 'one' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'two' );
		await page.keyboard.press( 'Tab' );
		await page.keyboard.type( 'cite' );
		await convertBlock( 'Pullquote' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'can be merged into from a paragraph', async () => {
		await insertBlock( 'Quote' );
		await insertBlock( 'Paragraph' );
		await page.keyboard.type( 'test' );
		await pressTimes( 'ArrowLeft', 'test'.length );
		await page.keyboard.press( 'Backspace' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );
