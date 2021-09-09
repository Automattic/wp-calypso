/**
 * @group calypso-pr
 */

import {
	DataHelper,
	LoginFlow,
	setupHooks,
	SidebarComponent,
	PlansPage,
	IndividualPurchasePage,
	CartCheckoutPage,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

const userOnPremiumPlan = 'defaultUser';

describe( DataHelper.createSuiteTitle( 'Plans: Purchases' ), function () {
	let page: Page;
	let plansPage: PlansPage;
	let purchasesPage: IndividualPurchasePage;
	let cartCheckoutPage: CartCheckoutPage;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Initial navigation', function () {
		it( 'Log In', async function () {
			const loginFlow = new LoginFlow( page, userOnPremiumPlan );
			await loginFlow.logIn();
		} );

		it( 'Navigate to Plans from sidebar', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Upgrades', 'Plans' );
		} );

		it( 'Click on the "My Plan" tab', async function () {
			plansPage = new PlansPage( page );
			await plansPage.clickTab( 'My Plan' );
		} );

		it( 'The Premium plan is listed as current plan on "My Plan" tab', async function () {
			await plansPage.validateActivePlanInMyPlanTab( 'Premium' );
		} );

		it( 'Click on the "Plans" navigation tab', async function () {
			await plansPage.clickTab( 'Plans' );
		} );
	} );

	describe( 'Manage current plan (Premium)', function () {
		const cartItemForPremiumPlan = 'WordPress.com Premium';
		it( 'Click on "Manage Plan" button for the active Premium plan', async function () {
			// This navigation also validates that we correctly identify the active plan in the Plans table.
			// The button text won't be correct if Premium isn't the active plan.
			await plansPage.clickPlanActionButton( { plan: 'Premium', buttonText: 'Manage plan' } );
		} );

		it( 'Land on a purchases page for the Premium plan', async function () {
			purchasesPage = new IndividualPurchasePage( page );
			await purchasesPage.validatePurchaseTitle( cartItemForPremiumPlan );
		} );

		it( 'Click on "Renew Now" card to renew plan', async function () {
			await purchasesPage.clickRenewNowCardButton();
		} );

		it( 'Land on cart page with Premium plan in cart', async function () {
			cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( cartItemForPremiumPlan );
		} );

		it( 'Remove plan from cart', async function () {
			// This removal is going to trigger an automatic asynchronous navigation back to the Plans page. Let's make sure we're ready for it!
			await Promise.all( [
				page.waitForNavigation(),
				cartCheckoutPage.removeCartItem( cartItemForPremiumPlan ),
			] );
		} );

		it( 'Automatically land back on "Plans" tab of Plans page', async function () {
			await page.waitForLoadState( 'load' );
			plansPage = new PlansPage( page );
			await plansPage.validateActiveNavigationTab( 'Plans' );
		} );
	} );

	describe( 'Plan upgrade (to Business)', function () {
		const cartItemForBusinessPlan = 'WordPress.com Business';
		it( 'Click on "Upgrade" button for a Business plan', async function () {
			await plansPage.clickPlanActionButton( { plan: 'Business', buttonText: 'Upgrade' } );
		} );

		it( 'Land on cart page with Premium plan in cart', async function () {
			cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( cartItemForBusinessPlan );
		} );

		it( 'Remove Business plan from cart', async function () {
			// This removal is going to trigger an automatic asynchronous navigation back to the Plans page. Let's make sure we're ready for it!
			await Promise.all( [
				page.waitForNavigation(),
				cartCheckoutPage.removeCartItem( cartItemForBusinessPlan ),
			] );
		} );

		it( 'Automatically land back on "Plans" tab of Plans page', async function () {
			await page.waitForLoadState( 'load' );
			plansPage = new PlansPage( page );
			await plansPage.validateActiveNavigationTab( 'Plans' );
		} );
	} );
} );
