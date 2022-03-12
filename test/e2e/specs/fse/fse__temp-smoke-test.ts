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
	const accountName = getTestAccountByFeature(
		{
			gutenberg: envVariables.GUTENBERG_EDGE ? 'edge' : 'stable',
			siteType: envVariables.TEST_ON_ATOMIC ? 'atomic' : 'simple',
		},
		[
			{ gutenberg: 'stable', siteType: 'simple', accountName: 'siteEditorSimpleSiteUser' },
			{ gutenberg: 'edge', siteType: 'simple', accountName: 'siteEditorSimpleSiteEdgeUser' },
		]
	);
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

	it( 'Editor content loads', async function () {
		// Because this is a temporary smoke test, adding the needed FSE selectors here instead of
		// spinning up a POM class that we will later needed to redo.
		// This should ensure the editor hasn't done a WSOD.
		const locator = page
			.frameLocator( '.calypsoify.is-iframe iframe.is-loaded' )
			.frameLocator( 'iframe[name="editor-canvas"]' )
			.locator( 'text=Home' );
		await locator.waitFor( { timeout: 90 * 1000 } );
	} );
} );
