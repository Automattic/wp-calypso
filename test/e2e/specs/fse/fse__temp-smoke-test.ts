/**
 * @group calypso-pr
 * @group gutenberg
 */

import {
	DataHelper,
	envVariables,
	SidebarComponent,
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

/**
 * This is a temporary smoke test for FSE on WordPress.com until a more comprehensive E2E strategy
 * can be designed and implemented.
 *
 * The goal here is to catch major breaks with the integration -- i.e. Calypso navigation no long working,
 * or getting a WSOD when trying to load the editor.
 */
describe( DataHelper.createSuiteTitle( 'Editor: Basic Post Flow' ), function () {
	let page: Page;
	const accountName = getTestAccountByFeature( {
		...envToFeatureKey( envVariables ),
		variant: 'siteEditor',
	} );

	beforeAll( async () => {
		page = await browser.newPage();

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Navigate to Full Site Editor', async function () {
		// Explicitly doing sidebar navigation to ensure Calypso navigation is intact.
		const sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Appearance', 'Editor' );
	} );

	it( 'Editor endpoint loads', async function () {
		await page.waitForURL( /.*site-editor.*/ );
	} );

	it( 'Editor canvas loads', async function () {
		// Because this is a temporary smoke test, adding the needed FSE selectors here instead of
		// spinning up a POM class that we will later needed to redo.
		// This should ensure the editor hasn't done a WSoD.
		const topFrameLocator = page.frameLocator( '.calypsoify.is-iframe iframe.is-loaded' );
		await topFrameLocator.locator( '[aria-label="Editor top bar"]' ).waitFor();

		const editorFrameLocator = topFrameLocator.frameLocator( 'iframe[title="Editor canvas"]' );
		await editorFrameLocator.locator( '.edit-site-block-editor__block-list' ).waitFor();
	} );
} );
