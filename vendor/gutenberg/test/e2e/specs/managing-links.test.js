/**
 * Internal dependencies
 */
import '../support/bootstrap';
import { newPost, newDesktopBrowserPage } from '../support/utils';

describe( 'Managing links', () => {
	beforeEach( async () => {
		await newDesktopBrowserPage();
		await newPost();
	} );

	const setFixedToolbar = async ( b ) => {
		await page.click( '.edit-post-more-menu button' );
		const button = ( await page.$x( '//button[contains(text(), \'Fix Toolbar to Top\')]' ) )[ 0 ];
		const buttonClassNameProperty = await button.getProperty( 'className' );
		const buttonClassName = await buttonClassNameProperty.jsonValue();
		const isSelected = buttonClassName.indexOf( 'is-selected' ) !== -1;
		if ( isSelected !== b ) {
			await button.click();
		} else {
			await page.click( '.edit-post-more-menu button' );
		}
	};

	it( 'Pressing Left and Esc in Link Dialog in "Fixed to Toolbar" mode', async () => {
		await setFixedToolbar( true );

		await page.click( '.editor-default-block-appender' );
		await page.keyboard.type( 'Text' );
		await page.click( 'button[aria-label="Link"]' );

		// Typing "left" should not close the dialog
		await page.keyboard.press( 'ArrowLeft' );
		let modal = await page.$( '.editor-format-toolbar__link-modal' );
		expect( modal ).not.toBeNull();

		// Escape should close the dialog still.
		await page.keyboard.press( 'Escape' );
		modal = await page.$( '.editor-format-toolbar__link-modal' );
		expect( modal ).toBeNull();
	} );

	it( 'Pressing Left and Esc in Link Dialog in "Docked Toolbar" mode', async () => {
		await setFixedToolbar( false );

		await page.click( '.editor-default-block-appender' );
		await page.keyboard.type( 'Text' );

		// we need to trigger isTyping = false
		await page.mouse.move( 200, 300 );
		await page.mouse.move( 250, 350 );

		await page.click( 'button[aria-label="Link"]' );

		// Typing "left" should not close the dialog
		await page.keyboard.press( 'ArrowLeft' );
		let modal = await page.$( '.editor-format-toolbar__link-modal' );
		expect( modal ).not.toBeNull();

		// Escape should close the dialog still.
		await page.keyboard.press( 'Escape' );
		modal = await page.$( '.editor-format-toolbar__link-modal' );
		expect( modal ).toBeNull();
	} );
} );
