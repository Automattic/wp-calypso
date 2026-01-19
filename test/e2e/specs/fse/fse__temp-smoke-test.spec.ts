/**
 * This is a temporary smoke test for FSE on WordPress.com until a more comprehensive E2E strategy
 * can be designed and implemented.
 *
 * The goal here is to catch major breaks with the integration --- i.e. Calypso navigation no longer working,
 * or getting a WSOD when trying to load the editor.
 *
 *
 * Keywords: FSE, Full Site Editor, Gutenberg
 */
import {
	SidebarComponent,
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
	FullSiteEditorPage,
	envVariables,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe(
	'Site Editor Smoke Test',
	{ tag: [ tags.CALYPSO_PR, tags.GUTENBERG, tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		test( 'As a user, I can navigate to and use the Full Site Editor', async ( { page } ) => {
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

			let testAccount: TestAccount;
			let fullSiteEditorPage: FullSiteEditorPage;

			await test.step( `Given I am authenticated as '${ accountName }'`, async function () {
				testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
			} );

			await test.step( 'When I navigate to Full Site Editor via sidebar', async function () {
				fullSiteEditorPage = new FullSiteEditorPage( page );

				// Explicitly doing sidebar navigation to ensure Calypso navigation is intact.
				const sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.navigate( 'Appearance', 'Editor' );
			} );

			await test.step( 'Then the editor endpoint loads', async function () {
				await page.waitForURL( /site-editor/ );
			} );

			await test.step( 'When I open the Index template', async function () {
				await fullSiteEditorPage.prepareForInteraction();

				await fullSiteEditorPage.ensureNavigationTopLevel();
				await fullSiteEditorPage.clickFullSiteNavigatorButton( 'Templates' );
				await fullSiteEditorPage.openTemplateEditor( 'Index' );
			} );

			await test.step( 'Then the editor canvas loads', async function () {
				await fullSiteEditorPage.waitUntilLoaded();
			} );
		} );
	}
);
