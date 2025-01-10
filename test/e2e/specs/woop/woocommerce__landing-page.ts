/**
 * @group calypso-pr
 */

import {
	DataHelper,
	SidebarComponent,
	TestAccount,
	WoocommerceLandingPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'WooCommerce Landing Page' ), function () {
	let page: Page;
	let landingPage: WoocommerceLandingPage;

	const testAccount = new TestAccount( 'defaultUser' );
	const siteDomain = testAccount.getSiteURL( { protocol: false } );

	beforeAll( async () => {
		page = await browser.newPage();

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

	it( 'Navigate to WooCommerce (landing page)', async function () {
		const sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'WooCommerce' );
	} );

	it( 'Open Learn more', async function () {
		landingPage = new WoocommerceLandingPage( page );
		await landingPage.openLearnMore();
		await landingPage.closeLearnMore();
	} );

	it( 'Open WooCommerce installer (/start)', async function () {
		landingPage = new WoocommerceLandingPage( page );
		await landingPage.openStoreSetup();
	} );
} );
