/**
 * Internal dependencies
 */
import {
	newPost,
	clickOnMoreMenuItem,
	clickOnCloseModalButton,
	pressWithModifier,
	ACCESS_MODIFIER_KEYS,
} from '../support/utils';

describe( 'keyboard shortcut help modal', () => {
	beforeAll( async () => {
		await newPost();
	} );

	it( 'displays the shortcut help modal when opened using the menu item in the more menu', async () => {
		await clickOnMoreMenuItem( 'Keyboard Shortcuts' );
		const shortcutHelpModalElements = await page.$$( '.edit-post-keyboard-shortcut-help' );
		expect( shortcutHelpModalElements ).toHaveLength( 1 );
	} );

	it( 'closes the shortcut help modal when the close icon is clicked', async () => {
		await clickOnCloseModalButton();
		const shortcutHelpModalElements = await page.$$( '.edit-post-keyboard-shortcut-help' );
		expect( shortcutHelpModalElements ).toHaveLength( 0 );
	} );

	it( 'displays the shortcut help modal when opened using the shortcut key (access+h)', async () => {
		await pressWithModifier( ACCESS_MODIFIER_KEYS, 'h' );
		const shortcutHelpModalElements = await page.$$( '.edit-post-keyboard-shortcut-help' );
		expect( shortcutHelpModalElements ).toHaveLength( 1 );
	} );

	it( 'closes the shortcut help modal when the shortcut key (access+h) is pressed again', async () => {
		await pressWithModifier( ACCESS_MODIFIER_KEYS, 'h' );
		const shortcutHelpModalElements = await page.$$( '.edit-post-keyboard-shortcut-help' );
		expect( shortcutHelpModalElements ).toHaveLength( 0 );
	} );
} );
