/**
 * @group calypso-pr
 * @group gutenberg
 * @group jetpack-wpcom-integration
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
describe( DataHelper.createSuiteTitle( 'Site Editor Smoke Test' ), function () {
	let page: Page;
	let fullSiteEditorPage: FullSiteEditorPage;
	let testAccount: TestAccount;

	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( { ...features, variant: 'siteEditor' } );

	beforeAll( async () => {
		page = await browser.newPage();

		testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Navigate to Full Site Editor', async function () {
		// Explicitly doing sidebar navigation to ensure Calypso navigation is intact.
		const sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Appearance', 'Editor' );
	} );

	it( 'Editor endpoint loads', async function () {
		await page.waitForURL( /site-editor/ );
	} );

	it( 'Open the Page template', async function () {
		fullSiteEditorPage = new FullSiteEditorPage( page );

		await fullSiteEditorPage.visit( testAccount.getSiteURL( { protocol: true } ) );
		await fullSiteEditorPage.prepareForInteraction();

		await fullSiteEditorPage.ensureNavigationTopLevel();
		await fullSiteEditorPage.clickFullSiteNavigatorButton( 'Templates' );
		await fullSiteEditorPage.clickFullSiteNavigatorButton( 'Page' );
		await fullSiteEditorPage.clickFullSiteNavigatorButton( 'Edit' );
	} );

	it( 'Editor canvas loads', async function () {
		await fullSiteEditorPage.waitUntilLoaded();
	} );
} );
