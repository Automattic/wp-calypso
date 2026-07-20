import {
	DataHelper,
	envVariables,
	SidebarComponent,
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
	FullSiteEditorPage,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

/**
 * This is a temporary smoke test for FSE on WordPress.com until a more comprehensive E2E strategy
 * can be designed and implemented.
 *
 * The goal here is to catch major breaks with the integration --- i.e. Calypso navigation no long working,
 * or getting a WSOD when trying to load the editor.
 *
 *
 * Keywords: FSE, Full Site Editor, Gutenberg
 */
test.describe(
	DataHelper.createSuiteTitle( 'Site Editor Smoke Test' ),
	{ tag: [ tags.CALYPSO_PR, tags.GUTENBERG, tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
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

		test( 'As a user, I can navigate to the Full Site Editor and load the editor canvas', async ( {
			page,
		} ) => {
			let fullSiteEditorPage: FullSiteEditorPage;

			await test.step( 'Authenticate and setup the test', async () => {
				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
			} );

			await test.step( 'Navigate to Full Site Editor', async () => {
				fullSiteEditorPage = new FullSiteEditorPage( page );

				// Explicitly doing sidebar navigation to ensure Calypso navigation is intact.
				const sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.navigate( 'Appearance', 'Editor' );
			} );

			await test.step( 'Editor endpoint loads', async () => {
				await page.waitForURL( /site-editor/ );
			} );

			await test.step( 'Open the Page template', async () => {
				await fullSiteEditorPage.prepareForInteraction();

				await fullSiteEditorPage.ensureNavigationTopLevel();
				await fullSiteEditorPage.clickFullSiteNavigatorButton( 'Templates' );
				await fullSiteEditorPage.openTemplateEditor( 'Index' );
			} );

			await test.step( 'Editor canvas loads', async () => {
				await fullSiteEditorPage.waitUntilLoaded();
			} );
		} );
	}
);
