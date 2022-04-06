/**
 * @group calypso-pr
 */

import {
	DataHelper,
	SidebarComponent,
	PlansPage,
	CartCheckoutPage,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Plans: Add Upgrade to Cart' ), function () {
	let page: Page;
	let plansPage: PlansPage;
	let cartCheckoutPage: CartCheckoutPage;

	beforeAll( async () => {
		page = await browser.newPage();

		const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
		await testAccount.authenticate( page );
	} );

	it( 'Navigate to Upgrades > Plans', async function () {
		const sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Upgrades', 'Plans' );
	} );

	describe( 'View Plans comparison', function () {
		it( 'Show full details of the plan', async function () {
			plansPage = new PlansPage( page, 'current' );
			await plansPage.clickPlanComparisonActionButton( 'show' );
		} );
	} );

	describe( 'Add WordPress.com Pro to cart', function () {
		it( `Click button to upgrade to WordPress.com Pro`, async function () {
			await plansPage.upgradeToPro();
		} );

		it( `WordPress.com Pro is added to cart`, async function () {
			cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( `WordPress.com Pro` );
		} );

		it( 'Remove plan from cart', async function () {
			await cartCheckoutPage.removeCartItem( `WordPress.com Pro` );
		} );

		it( 'Automatically navigated back to Plans page', async function () {
			await plansPage.validateActiveNavigationTab( 'New Plans' );
		} );
	} );
} );
