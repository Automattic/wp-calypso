/**
 * Internal dependencies
 */
import { newPost, getEditedPostContent, openDocumentSettingsSidebar } from '../support/utils';
import { activatePlugin, deactivatePlugin } from '../support/plugins';

describe( 'new editor filtered state', () => {
	beforeAll( async () => {
		await activatePlugin( 'gutenberg-test-plugin-default-post-content' );
	} );

	beforeEach( async () => {
		await newPost();
	} );

	afterAll( async () => {
		await deactivatePlugin( 'gutenberg-test-plugin-default-post-content' );
	} );

	it( 'should respect default content', async () => {
		// get the values that should have their defaults changed.
		const title = await page.$eval(
			'.editor-post-title__input',
			( element ) => element.innerHTML
		);
		const content = await getEditedPostContent();

		// open the sidebar, we want to see the excerpt.
		await openDocumentSettingsSidebar();
		const [ excerptButton ] = await page.$x( '//div[@class="edit-post-sidebar"]//button[@class="components-button components-panel__body-toggle"][contains(text(),"Excerpt")]' );
		if ( excerptButton ) {
			await excerptButton.click( 'button' );
		}
		const excerpt = await page.$eval(
			'.editor-post-excerpt textarea',
			( element ) => element.innerHTML
		);

		// assert they match what the plugin set.
		expect( title ).toBe( 'My default title' );
		expect( content ).toBe( 'My default content' );
		expect( excerpt ).toBe( 'My default excerpt' );
	} );
} );
