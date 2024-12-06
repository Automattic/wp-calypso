/**
 * @group calypso-pr
 * @group jetpack-wpcom-integration
 */

import {
	getTestAccountByFeature,
	envToFeatureKey,
	envVariables,
	DataHelper,
	MarketingPage,
	TestAccount,
	NoticeComponent,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

/**
 * Quick test to verify various SEO text fields and previews render.
 *
 * This is a feature exclusive to Business plans and higher.
 *
 * Keywords: Jetpack, SEO, Traffic, Marketing.
 */
describe( DataHelper.createSuiteTitle( 'Marketing: SEO Preview' ), function () {
	const externalPreviewText = DataHelper.getRandomPhrase();

	let page: Page;
	let testAccount: TestAccount;
	let marketingPage: MarketingPage;

	beforeAll( async () => {
		page = await browser.newPage();

		// Simple sites do not have the ability to change SEO parameters.
		const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ), [
			{
				gutenberg: 'stable',
				siteType: 'simple',
				accountName: 'atomicUser',
			},
			{
				gutenberg: 'edge',
				siteType: 'simple',
				accountName: 'atomicUser',
			},
		] );
		testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );

		marketingPage = new MarketingPage( page );
	} );

	it( 'Navigate to Tools > Marketing > Traffic page', async function () {
		await marketingPage.visitTab( testAccount.getSiteURL( { protocol: false } ), 'traffic' );
	} );

	it( 'Enter and verify SEO page title front page structure', async function () {
		const frontPageText = DataHelper.getRandomPhrase();
		await marketingPage.enterPageTitleStructure( 'Front Page', frontPageText );

		await marketingPage.validatePreviewTextForPageStructureCategory( frontPageText );
	} );

	it( 'Enter SEO external preview description', async function () {
		await marketingPage.enterExternalPreviewText( externalPreviewText );
	} );

	it( 'Open SEO preview', async function () {
		await marketingPage.clickButton( 'Show Previews' );
	} );

	it( 'Verify preview for Facebook', async function () {
		await marketingPage.validateExternalPreview( 'Facebook', externalPreviewText );
	} );

	it( 'Close SEO preview', async function () {
		await marketingPage.clickButton( 'Close preview' );
	} );

	it( 'Save changes', async function () {
		await marketingPage.saveSettings();

		const noticeComponent = new NoticeComponent( page );
		await noticeComponent.noticeShown( 'Settings saved successfully!' );
	} );
} );
