import {
	DataHelper,
	EditorPage,
	TestAccount,
	envVariables,
	envToFeatureKey,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { test, tags } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Editor: Navbar' ),
	{ tag: [ tags.GUTENBERG, tags.CALYPSO_PR ] },
	() => {
		const features = envToFeatureKey( envVariables );
		// @todo Does it make sense to create a `simpleSitePersonalPlanUserEdge` with GB edge?
		// for now, it will pick up the default `gutenbergAtomicSiteEdgeUser` if edge is set.
		const accountName = getTestAccountByFeature( features, [
			{
				gutenberg: 'stable',
				siteType: 'simple',
				accountName: 'simpleSitePersonalPlanUser',
			},
		] );

		let page: Page;
		let browser: Browser;
		let editorPage: EditorPage;

		test.beforeAll( async ( { browser: browserFixture } ) => {
			browser = browserFixture;
			page = await browser.newPage();
			editorPage = new EditorPage( page );

			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		test( 'Given user authenticated When navigating to new post page Then editor loads', async () => {
			await editorPage.visit( 'post' );
		} );

		test( 'Given editor loaded When returning to dashboard Then user navigates back to Calypso', async ( {
			viewportName,
		} ) => {
			const WPAdminBarLocator = page.locator( '#wpadminbar' );
			const isMobileClassicView =
				viewportName === 'mobile' && ( await WPAdminBarLocator.isVisible() );

			// The classic WP Admin Bar on mobile viewport doesn't have the
			// "return" button, so let's not fail this test if it's the case.
			// See https://github.com/Automattic/wp-calypso/pull/70982
			if ( ! isMobileClassicView ) {
				await editorPage.exitEditor();
			}
		} );
	}
);
