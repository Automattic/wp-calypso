/**
 * @group gutenberg
 * @group calypso-pr
 */

import {
	DataHelper,
	EditorPage,
	TestAccount,
	envVariables,
	envToFeatureKey,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( `Editor: Navbar` ), function () {
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
	let editorPage: EditorPage;

	beforeAll( async () => {
		page = await browser.newPage();
		editorPage = new EditorPage( page );

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
		await testAccount.authenticateWpAdmin( page );
	} );

	it( 'Go to the new post page', async function () {
		await editorPage.visit( 'post' );
	} );

	it( 'Return to Calypso dashboard', async function () {
		const WPAdminBarLocator = page.locator( '#wpadminbar' );
		const isMobileClassicView =
			envVariables.VIEWPORT_NAME === 'mobile' && ( await WPAdminBarLocator.isVisible() );

		// The classic WP Admin Bar on mobile viewport doesn't have the
		// "return" button, so let's not fail this test if it's the case.
		// See https://github.com/Automattic/wp-calypso/pull/70982
		if ( ! isMobileClassicView ) {
			await editorPage.exitEditor();
		}
	} );
} );
