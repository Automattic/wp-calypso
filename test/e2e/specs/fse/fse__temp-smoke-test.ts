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
 * The goal here is to catch major breaks with the integration --- i.e. Calypso navigation no long working,
 * or getting a WSOD when trying to load the editor.
 *
 *
 * Keywords: FSE, Full Site Editor, Gutenberg
 */
describe( DataHelper.createSuiteTitle( 'Site Editor Smoke Test' ), function () {
	let page: Page;
	let testAccount: TestAccount;
	let fullSiteEditorPage: FullSiteEditorPage;

	// Jetpack deploy (`atomicVariation`) and CoBlocks (`coblocks`) have to use different sets of
	// feature keys.
	// CoBlocks needs to override what `getTestAccountByFeature` would return in case of CoBlocks EDGE and
	// FSE, so the additional `variant` value is set.
	// Meanwhile, for Jetpack deploys the extra `variant` causes `getTestAccountByFeature` to report
	// no valid match, because none of the Jetpack deploy test users contain the key `variant`.
	let features = envToFeatureKey( envVariables );
	if ( envVariables.COBLOCKS_EDGE ) {
		features = { ...features, variant: 'siteEditor' };
	}

	const accountName = getTestAccountByFeature( features, [
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

	beforeAll( async () => {
		page = await browser.newPage();

		testAccount = new TestAccount( accountName );
		if ( accountName === 'jetpackAtomicEcommPlanUser' ) {
			// Switching to or logging into eCommerce plan sites inevitably
			// loads WP-Admin instead of Calypso, but the rediret occurs
			// only after Calypso attempts to load.
			await testAccount.authenticate( page, { url: /wp-admin/ } );
		} else {
			await testAccount.authenticate( page );
		}
	} );

	it( 'Navigate to Full Site Editor', async function () {
		fullSiteEditorPage = new FullSiteEditorPage( page );

		// eCommerce plan loads WP-Admin for home dashboard,
		// so instead navigate straight to the FSE page.
		if ( envVariables.ATOMIC_VARIATION === 'ecomm-plan' ) {
			await fullSiteEditorPage.visit( testAccount.getSiteURL( { protocol: true } ) );
		} else {
			// Explicitly doing sidebar navigation to ensure Calypso navigation is intact.
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Appearance', 'Editor' );
		}
	} );

	it( 'Editor endpoint loads', async function () {
		await page.waitForURL( /site-editor/ );
	} );

	it( 'Open the Page template', async function () {
		await fullSiteEditorPage.prepareForInteraction();

		await fullSiteEditorPage.ensureNavigationTopLevel();
		await fullSiteEditorPage.clickFullSiteNavigatorButton( 'Templates' );
		await fullSiteEditorPage.clickFullSiteNavigatorButton( 'Index' );
		await fullSiteEditorPage.clickFullSiteNavigatorButton( 'Edit' );
	} );

	it( 'Editor canvas loads', async function () {
		await fullSiteEditorPage.waitUntilLoaded();
	} );
} );
