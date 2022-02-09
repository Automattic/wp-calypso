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

	describe( 'Learn more button opens a support article', function () {
		let landingPage: WoocommerceLandingPage;

		beforeAll( async () => {
			page = await browser.newPage();

			const testAccount = new TestAccount( 'defaultUser' );
			await testAccount.authenticate( page );
		} );

		afterAll( async () => {
			await page.close();
		} );

		it( 'Navigate to WooCommerce (landing page)', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'WooCommerce' );
		} );

		it( 'Open Learn more', async function () {
			landingPage = new WoocommerceLandingPage( page );
			await landingPage.openLearnMore();
		} );
	} );

	describe( 'Start a new store takes you to the woo installer', function () {
		let landingPage: WoocommerceLandingPage;

		beforeAll( async () => {
			page = await browser.newPage();

			const testAccount = new TestAccount( 'defaultUser' );
			await testAccount.authenticate( page );
		} );

		afterAll( async () => {
			await page.close();
		} );

		it( 'Navigate to WooCommerce (landing page)', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'WooCommerce' );
		} );

		it( 'Open WooCommerce installer (/start)', async function () {
			landingPage = new WoocommerceLandingPage( page );
			await landingPage.openStoreSetup();
		} );
	} );
} );
