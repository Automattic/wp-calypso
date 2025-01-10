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
	const testAccount = new TestAccount( accountName );
	const testAccountSiteDomain = testAccount.getSiteURL( { protocol: false } );
	let page: Page;
	let marketingPage: MarketingPage;

	beforeAll( async () => {
		page = await browser.newPage();

		await testAccount.authenticate( page );

		marketingPage = new MarketingPage( page );
	} );

	it( 'Dismiss the Sites Guide and pick a site', async function () {
		try {
			// Wait for the Guide's close button to appear
			await page.waitForSelector(
				'button.components-button.is-small.has-icon[aria-label="Close"]'
			);
			// Dismiss the Sites guide
			await page.click( 'button.components-button.is-small.has-icon[aria-label="Close"]' );
			await page.isHidden( 'button.components-button.is-small.has-icon[aria-label="Close"]' );
		} catch ( e ) {
			// No guide was shown, continue
		}

		const calypsoSiteUrl = DataHelper.getCalypsoURL( `/home/${ testAccountSiteDomain }` );
		await page.goto( calypsoSiteUrl );
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
