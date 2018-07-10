/**
 * Internal dependencies
 */
import '../support/bootstrap';
import {
	clickOnMoreMenuItem,
	openDocumentSettingsSidebar,
	newPost,
	newDesktopBrowserPage,
} from '../support/utils';
import { activatePlugin, deactivatePlugin } from '../support/plugins';

describe( 'Using Plugins API', () => {
	beforeAll( async () => {
		await newDesktopBrowserPage();
		await activatePlugin( 'gutenberg-test-plugin-plugins-api' );
		await newPost();
	} );

	afterAll( async () => {
		await newDesktopBrowserPage();
		await deactivatePlugin( 'gutenberg-test-plugin-plugins-api' );
	} );

	describe( 'Post Status Info', () => {
		it( 'Should render post status info inside Document Setting sidebar', async () => {
			await openDocumentSettingsSidebar();

			const pluginPostStatusInfoText = await page.$eval( '.edit-post-post-status .my-post-status-info-plugin', ( el ) => el.innerText );
			expect( pluginPostStatusInfoText ).toBe( 'My post status info' );
		} );
	} );

	describe( 'Sidebar', () => {
		it( 'Should open plugins sidebar using More Menu item and render content', async () => {
			await clickOnMoreMenuItem( 'Sidebar title plugin' );

			const pluginSidebarContent = await page.$eval( '.edit-post-sidebar', ( el ) => el.innerHTML );
			expect( pluginSidebarContent ).toMatchSnapshot();
		} );

		it( 'Should close plugins sidebar using More Menu item', async () => {
			await clickOnMoreMenuItem( 'Sidebar title plugin' );

			const pluginSidebar = await page.$( '.edit-post-sidebar' );
			expect( pluginSidebar ).toBeNull();
		} );
	} );
} );
