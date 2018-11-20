/**
 * Internal dependencies
 */
import {
	clickBlockAppender,
	newPost,
} from '../support/utils';
import { activatePlugin, deactivatePlugin } from '../support/plugins';

describe( 'Using Hooks API', () => {
	beforeAll( async () => {
		await activatePlugin( 'gutenberg-test-hooks-api' );
	} );

	afterAll( async () => {
		await deactivatePlugin( 'gutenberg-test-hooks-api' );
	} );

	beforeEach( async () => {
		await newPost();
	} );

	it( 'Should contain a reset block button on the sidebar', async () => {
		await clickBlockAppender();
		await page.keyboard.type( 'First paragraph' );
		expect( await page.$( '.edit-post-sidebar .e2e-reset-block-button' ) ).not.toBeNull();
	} );

	it( 'Pressing reset block button resets the block', async () => {
		await clickBlockAppender();
		await page.keyboard.type( 'First paragraph' );
		const paragraphContent = await page.$eval( 'div[data-type="core/paragraph"] p', ( element ) => element.textContent );
		expect( paragraphContent ).toEqual( 'First paragraph' );
		await page.click( '.edit-post-sidebar .e2e-reset-block-button' );
		const newParagraphContent = await page.$eval( 'div[data-type="core/paragraph"] p', ( element ) => element.textContent );
		expect( newParagraphContent ).toEqual( '' );
	} );
} );
