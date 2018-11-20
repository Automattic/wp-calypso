/**
 * External dependencies
 */
import { last } from 'lodash';
import { parse } from 'url';

/**
 * Internal dependencies
 */
import {
	newPost,
	getUrl,
	publishPost,
} from '../support/utils';

describe( 'Preview', () => {
	beforeEach( async () => {
		await newPost();
	} );

	async function openPreviewPage( editorPage ) {
		let openTabs = await browser.pages();
		const expectedTabsCount = openTabs.length + 1;
		await editorPage.click( '.editor-post-preview' );

		// Wait for the new tab to open.
		while ( openTabs.length < expectedTabsCount ) {
			await editorPage.waitFor( 1 );
			openTabs = await browser.pages();
		}

		const previewPage = last( openTabs );
		// Wait for the preview to load. We can't do interstitial detection here,
		// because it might load too quickly for us to pick up, so we wait for
		// the preview to load by waiting for the title to appear.
		await previewPage.waitForSelector( '.entry-title' );
		return previewPage;
	}

	/**
	 * Given a Puppeteer Page instance for a preview window, clicks Preview, and
	 * awaits the window navigation.
	 *
	 * @param {puppeteer.Page} previewPage Page on which to await navigation.
	 *
	 * @return {Promise} Promise resolving once navigation completes.
	 */
	async function waitForPreviewNavigation( previewPage ) {
		const navigationCompleted = previewPage.waitForNavigation();
		await page.click( '.editor-post-preview' );
		return navigationCompleted;
	}

	it( 'Should open a preview window for a new post', async () => {
		const editorPage = page;

		// Disabled until content present.
		const isPreviewDisabled = await editorPage.$$eval(
			'.editor-post-preview:not( :disabled )',
			( enabledButtons ) => ! enabledButtons.length,
		);
		expect( isPreviewDisabled ).toBe( true );

		await editorPage.type( '.editor-post-title__input', 'Hello World' );

		const previewPage = await openPreviewPage( editorPage );

		// When autosave completes for a new post, the URL of the editor should
		// update to include the ID. Use this to assert on preview URL.
		const [ , postId ] = await( await editorPage.waitForFunction( () => {
			return window.location.search.match( /[\?&]post=(\d+)/ );
		} ) ).jsonValue();

		let expectedPreviewURL = getUrl( '', `?p=${ postId }&preview=true` );
		expect( previewPage.url() ).toBe( expectedPreviewURL );

		// Title in preview should match input.
		let previewTitle = await previewPage.$eval( '.entry-title', ( node ) => node.textContent );
		expect( previewTitle ).toBe( 'Hello World' );

		// Return to editor to change title.
		await editorPage.bringToFront();
		await editorPage.type( '.editor-post-title__input', '!' );
		await waitForPreviewNavigation( previewPage );

		// Title in preview should match updated input.
		previewTitle = await previewPage.$eval( '.entry-title', ( node ) => node.textContent );
		expect( previewTitle ).toBe( 'Hello World!' );

		// Pressing preview without changes should bring same preview window to
		// front and reload, but should not show interstitial.
		await editorPage.bringToFront();
		await waitForPreviewNavigation( previewPage );
		previewTitle = await previewPage.$eval( '.entry-title', ( node ) => node.textContent );
		expect( previewTitle ).toBe( 'Hello World!' );

		// Preview for published post (no unsaved changes) directs to canonical
		// URL for post.
		await editorPage.bringToFront();
		await publishPost();
		await Promise.all( [
			editorPage.waitForFunction( () => ! document.querySelector( '.editor-post-preview' ) ),
			editorPage.click( '.editor-post-publish-panel__header button' ),
		] );
		expectedPreviewURL = await editorPage.$eval( '.components-notice.is-success a', ( node ) => node.href );

		await editorPage.bringToFront();
		await waitForPreviewNavigation( previewPage );
		expect( previewPage.url() ).toBe( expectedPreviewURL );

		// Return to editor to change title.
		await editorPage.bringToFront();
		await editorPage.type( '.editor-post-title__input', ' And more.' );
		await waitForPreviewNavigation( previewPage );

		// Title in preview should match updated input.
		previewTitle = await previewPage.$eval( '.entry-title', ( node ) => node.textContent );
		expect( previewTitle ).toBe( 'Hello World! And more.' );

		// Published preview URL should include ID and nonce parameters.
		const { query } = parse( previewPage.url(), true );
		expect( query ).toHaveProperty( 'preview_id' );
		expect( query ).toHaveProperty( 'preview_nonce' );

		// Return to editor. Previewing already-autosaved preview tab should
		// reuse the opened tab, skipping interstitial. This resolves an edge
		// cases where the post is dirty but not autosaveable (because the
		// autosave is already up-to-date).
		//
		// See: https://github.com/WordPress/gutenberg/issues/7561
		await editorPage.bringToFront();
		await waitForPreviewNavigation( previewPage );

		// Title in preview should match updated input.
		previewTitle = await previewPage.$eval( '.entry-title', ( node ) => node.textContent );
		expect( previewTitle ).toBe( 'Hello World! And more.' );

		await previewPage.close();
	} );
} );
