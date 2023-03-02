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
	FullSiteEditorPage,
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
	let fullSiteEditorPage: FullSiteEditorPage;

	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( { ...features, variant: 'siteEditor' } );

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

	// Skipping test until we have a way to reliably close the nav sidebar.
	it.skip( 'Editor canvas loads', async function () {
		fullSiteEditorPage = new FullSiteEditorPage( page, { target: features.siteType } );
		// The site editor navigation sidebar opens by default, so we close it
		await fullSiteEditorPage.closeNavSidebar();
		await fullSiteEditorPage.waitUntilLoaded();
	} );
} );
