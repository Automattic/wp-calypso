/**
 * @group calypso-pr
 */

import {
	DataHelper,
	SidebarComponent,
	PlansPage,
	IndividualPurchasePage,
	CartCheckoutPage,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Plans (Legacy): Renew' ), function () {
	const planTier = 'Personal';
	const planName = `WordPress.com ${ planTier }`;
	let page: Page;
	let plansPage: PlansPage;
	let individualPurchasesPage: IndividualPurchasePage;
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

	describe( 'Validate current plan', function () {
		it( 'Click on the My Plans tab', async function () {
			await plansPage.clickTab( 'My Plan' );
		} );

		it( `${ planName } is the active plan`, async function () {
			await plansPage.validateActivePlan( planTier );
		} );
	} );

	describe( 'Renew Plan', function () {
		it( `Details of purchased plan ${ planTier } are shown`, async function () {
			const plansPage = new PlansPage( page, 'legacy' );
			await plansPage.clickManagePlan();

			individualPurchasesPage = new IndividualPurchasePage( page );
			await individualPurchasesPage.validatePurchaseTitle( planName );
		} );

		it( 'Renew plan', async function () {
			await individualPurchasesPage.clickRenewNowCardButton();
		} );

		it( `${ planName } is added to cart`, async function () {
			cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( planName );
		} );

		it( `Remove ${ planName } from cart`, async function () {
			await cartCheckoutPage.removeCartItem( planName );
		} );

		it( 'Automatically return to purchase page', async function () {
			individualPurchasesPage = new IndividualPurchasePage( page );
			await individualPurchasesPage.validatePurchaseTitle( planName );
		} );
	} );
} );
