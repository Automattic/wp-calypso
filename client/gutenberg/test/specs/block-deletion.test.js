/**
 * Internal dependencies
 */
import {
	clickBlockAppender,
	getEditedPostContent,
	newPost,
	pressWithModifier,
	ACCESS_MODIFIER_KEYS,
} from '../support/utils';

const addThreeParagraphsToNewPost = async () => {
	await newPost();

	// Add demo content
	await clickBlockAppender();
	await page.keyboard.type( 'First paragraph' );
	await page.keyboard.press( 'Enter' );
	await page.keyboard.type( 'Second paragraph' );
	await page.keyboard.press( 'Enter' );
};

const clickOnBlockSettingsMenuItem = async ( buttonLabel ) => {
	await expect( page ).toClick( '.editor-block-settings-menu__toggle' );
	const itemButton = ( await page.$x( `//*[contains(@class, "editor-block-settings-menu__popover")]//button[contains(text(), '${ buttonLabel }')]` ) )[ 0 ];
	await itemButton.click();
};

describe( 'block deletion -', () => {
	beforeEach( addThreeParagraphsToNewPost );

	describe( 'deleting the third block using the Remove Block menu item', () => {
		it( 'results in two remaining blocks and positions the caret at the end of the second block', async () => {
			// The blocks can't be empty to trigger the toolbar
			await page.keyboard.type( 'Paragraph to remove' );

			// Move the mouse to show the block toolbar
			await page.mouse.move( 200, 300, { steps: 10 } );

			await clickOnBlockSettingsMenuItem( 'Remove Block' );
			expect( await getEditedPostContent() ).toMatchSnapshot();

			// Type additional text and assert that caret position is correct by comparing to snapshot.
			await page.keyboard.type( ' - caret was here' );
			expect( await getEditedPostContent() ).toMatchSnapshot();
		} );
	} );

	describe( 'deleting the third block using the Remove Block shortcut', () => {
		it( 'results in two remaining blocks and positions the caret at the end of the second block', async () => {
			// Type some text to assert that the shortcut also deletes block content.
			await page.keyboard.type( 'this is block 2' );
			await pressWithModifier( ACCESS_MODIFIER_KEYS, 'z' );
			expect( await getEditedPostContent() ).toMatchSnapshot();

			// Type additional text and assert that caret position is correct by comparing to snapshot.
			await page.keyboard.type( ' - caret was here' );
			expect( await getEditedPostContent() ).toMatchSnapshot();
		} );
	} );

	describe( 'deleting the third block using backspace in an empty block', () => {
		it( 'results in two remaining blocks and positions the caret at the end of the second block', async () => {
			await page.keyboard.press( 'Backspace' );
			expect( await getEditedPostContent() ).toMatchSnapshot();

			// Type additional text and assert that caret position is correct by comparing to snapshot.
			await page.keyboard.type( ' - caret was here' );
			expect( await getEditedPostContent() ).toMatchSnapshot();
		} );
	} );

	describe( 'deleting the third block using backspace with block wrapper selection', () => {
		it( 'results in three remaining blocks and positions the caret at the end of the third block', async () => {
			// Add an image block since it's easier to click the wrapper on non-textual blocks.
			await page.keyboard.type( '/image' );
			await page.keyboard.press( 'Enter' );

			// Click on something that's not a block.
			await page.click( '.editor-post-title' );

			// Click on the third (image) block so that its wrapper is selected and backspace to delete it.
			await page.click( '.editor-block-list__block:nth-child(3) .components-placeholder__label' );
			await page.keyboard.press( 'Backspace' );

			expect( await getEditedPostContent() ).toMatchSnapshot();

			// Type additional text and assert that caret position is correct by comparing to snapshot.
			await page.keyboard.type( ' - caret was here' );
			expect( await getEditedPostContent() ).toMatchSnapshot();
		} );
	} );

	describe( 'deleting third third and fourth blocks using backspace with multi-block selection', () => {
		it( 'results in two remaining blocks and positions the caret at the end of the second block', async () => {
			// Add a third paragraph for this test.
			await page.keyboard.type( 'Third paragraph' );
			await page.keyboard.press( 'Enter' );

			// Press the up arrow once to select the third and fourth blocks.
			await pressWithModifier( 'Shift', 'ArrowUp' );

			// Now that the block wrapper is selected, press backspace to delete it.
			await page.keyboard.press( 'Backspace' );
			expect( await getEditedPostContent() ).toMatchSnapshot();

			// Type additional text and assert that caret position is correct by comparing to snapshot.
			await page.keyboard.type( ' - caret was here' );
			expect( await getEditedPostContent() ).toMatchSnapshot();
		} );
	} );
} );
