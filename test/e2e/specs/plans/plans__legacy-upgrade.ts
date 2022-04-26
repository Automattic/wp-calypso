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

describe( DataHelper.createSuiteTitle( 'Plans (Legacy): Upgrade' ), function () {
	const planName = 'Business';
	let page: Page;
	let plansPage: PlansPage;
	let cartCheckoutPage: CartCheckoutPage;

	beforeAll( async () => {
		page = await browser.newPage();

		const testAccount = new TestAccount( 'simpleSitePersonalPlanUser' );
		await testAccount.authenticate( page );
		plansPage = new PlansPage( page, 'legacy' );
	} );

	it( 'Navigate to Upgrades > Plans', async function () {
		const sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Upgrades', 'Plans' );
	} );

	it( 'Click on the Plans tab', async function () {
		await plansPage.clickTab( 'Plans' );
	} );

	describe( 'Upgrade Plan', function () {
		it( `Click on "Upgrade" button for WordPress.com ${ planName }`, async function () {
			await plansPage.clickPlanActionButton( { plan: planName, buttonText: 'Upgrade' } );
		} );

		it( `WordPress.com ${ planName } is added to cart`, async function () {
			cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
		} );

		it( 'Remove plan from cart', async function () {
			await cartCheckoutPage.removeCartItem( `WordPress.com ${ planName }` );
		} );

		it( 'Automatically return to Plans page', async function () {
			await plansPage.validateActiveNavigationTab( 'Plans' );
		} );
	} );
} );
