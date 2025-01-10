/**
 * @group calypso-pr
 */

import {
	TestAccount,
	BrowserManager,
	RestAPIClient,
	MyHomePage,
	PlansPage,
	DataHelper,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( 'Domain: Upsell (Home)', function () {
	let myHomePage: MyHomePage;
	let plansPage: PlansPage;
	let suggestedDomain: string;
	let page: Page;

	const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
	const siteDomain = testAccount.getSiteURL( { protocol: false } );

	beforeAll( async function () {
		const restAPIClient = new RestAPIClient( testAccount.credentials );
		await restAPIClient.clearShoppingCart(
			testAccount.credentials.testSites?.primary?.id as number
		);

		page = await browser.newPage();
		await BrowserManager.setStoreCookie( page );

		await testAccount.authenticate( page );
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

		const calypsoSiteUrl = DataHelper.getCalypsoURL( `/home/${ siteDomain }` );
		await page.goto( calypsoSiteUrl );
	} );

	it( 'Wait for Home dashboard to fully load', async function () {
		// There is nothing in the front-end to key off to confirm whether the
		// Home dashboard has fully loaded.
		// This is a serious compromise to get the ball moving on this refactor.
		// See: https://github.com/Automattic/wp-calypso/issues/78414
		try {
			// Suppress errors because the intention here is to add some wait
			// for the Home dashboard to finish loading.
			await page.waitForLoadState( 'networkidle' );
		} catch {
			// noop
		}
	} );

	it( 'Domain upsell card is present', async function () {
		myHomePage = new MyHomePage( page );

		expect( await myHomePage.isHeadingPresent( /domain/ ) ).toBe( true );
	} );

	it( 'Domain upsell card has suggested domain', async function () {
		suggestedDomain = await myHomePage.getSuggestedUpsellDomain();

		expect( suggestedDomain ).not.toBe( '' );
	} );

	it( 'Click to begin searching for a domain', async function () {
		await myHomePage.clickButton( 'Get this domain' );

		// The test user does not have a plan so the Plans upsell page will load.
		await page.waitForURL( /plans\/yearly/ );
	} );

	it( 'Choose the Free plan', async function () {
		plansPage = new PlansPage( page );

		await plansPage.selectPlan( 'Free' );
	} );

	it( 'Dismiss paid plan upgrade CTA', async function () {
		await page.getByRole( 'button', { name: 'That works for me' } ).click();
	} );

	it( 'Secure checkout loads', async function () {
		// Intentionally not checking whether the selected domain loads here,
		// because this spec can run in parallel in many branches thus leading
		// to a race condition.
		await page.waitForURL( /checkout/ );
	} );
} );
