import {
	DataHelper,
	envVariables,
	SidebarComponent,
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
	FullSiteEditorPage,
} from '@automattic/calypso-e2e';
import { Page } from '@playwright/test';
import { test, tags } from '../../lib/pw-base';

/**
 * This is a temporary smoke test for FSE on WordPress.com until a more comprehensive E2E strategy
 * can be designed and implemented.
 *
 * The goal here is to catch major breaks with the integration --- i.e. Calypso navigation no long working,
 * or getting a WSOD when trying to load the editor.
 *
 * Keywords: FSE, Full Site Editor, Gutenberg
 */
test.describe(
	DataHelper.createSuiteTitle( 'Site Editor Smoke Test' ),
	{
		tag: [ tags.CALYPSO_PR, tags.GUTENBERG, tags.JETPACK_WPCOM_INTEGRATION ],
	},
	() => {
		test.skip( ( { viewportName } ) => viewportName === 'mobile', 'Skipped on mobile viewports' );

		let page: Page;
		let testAccount: TestAccount;
		let fullSiteEditorPage: FullSiteEditorPage;

		test.beforeAll( async ( { browser } ) => {
			const features = envToFeatureKey( envVariables );
			const accountName = getTestAccountByFeature( { ...features, variant: 'siteEditor' }, [
				// None of our CoBlocks users use block themes, so we need to fall back to the default Gutenberg users
				// if COBLOCKS_EDGE is set.
				{
					gutenberg: 'stable',
					coblocks: 'edge',
					siteType: 'simple',
					variant: 'siteEditor',
					accountName: 'siteEditorSimpleSiteUser',
				},
				{
					gutenberg: 'edge',
					coblocks: 'edge',
					siteType: 'simple',
					variant: 'siteEditor',
					accountName: 'siteEditorSimpleSiteEdgeUser',
				},
				{
					gutenberg: 'stable',
					coblocks: 'edge',
					siteType: 'atomic',
					variant: 'siteEditor',
					accountName: 'siteEditorAtomicSiteUser',
				},
				{
					gutenberg: 'edge',
					coblocks: 'edge',
					siteType: 'atomic',
					variant: 'siteEditor',
					accountName: 'siteEditorAtomicSiteEdgeUser',
				},
			] );

			page = await browser.newPage();

			testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		test( 'Given user is authenticated When navigating to Full Site Editor via sidebar Then the editor page loads', async () => {
			fullSiteEditorPage = new FullSiteEditorPage( page );

			// Explicitly doing sidebar navigation to ensure Calypso navigation is intact.
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Appearance', 'Editor' );

			await page.waitForURL( /site-editor/ );
		} );

		test( 'Given the Full Site Editor page is loaded When preparing for interaction Then the navigation is accessible', async () => {
			await fullSiteEditorPage.prepareForInteraction();

			await fullSiteEditorPage.ensureNavigationTopLevel();
		} );

		test( 'Given the Full Site Editor is ready When opening the Index template Then the template editor loads', async () => {
			await fullSiteEditorPage.clickFullSiteNavigatorButton( 'Templates' );
			await fullSiteEditorPage.openTemplateEditor( 'Index' );
		} );

		test( 'Given the Index template is opened When checking the editor state Then the editor canvas is fully loaded', async () => {
			await fullSiteEditorPage.waitUntilLoaded();
		} );
	}
);
