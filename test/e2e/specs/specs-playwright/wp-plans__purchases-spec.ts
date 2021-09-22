/**
 * @group calypso-pr
 */

import {
	DataHelper,
	LoginPage,
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

	setupHooks( ( args: { page: Page } ) => {
		page = args.page;
	} );

	describe( 'Initial navigation', function () {
		it( 'Log in', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.login( { account: userOnPremiumPlan } );
		} );

		it( 'Navigate to Upgrades > Plans', async function () {
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

	describe( 'Manage current plan (WordPress.com Premium)', function () {
		const cartItemForPremiumPlan = 'WordPress.com Premium';

		it( 'Click on "Manage Plan" button for WordPress.com Premium plan', async function () {
			// This navigation also validates that we correctly identify the active plan in the Plans table.
			// The button text won't be correct if Premium isn't the active plan.
			await plansPage.clickPlanActionButton( { plan: 'Premium', buttonText: 'Manage plan' } );
		} );

		it( 'Land on a purchases page', async function () {
			purchasesPage = new IndividualPurchasePage( page );
			await purchasesPage.validatePurchaseTitle( cartItemForPremiumPlan );
		} );

		it( 'Click on "Renew Now"', async function () {
			await purchasesPage.clickRenewNowCardButton();
		} );

		it( 'WordPress.com Premium is added to cart', async function () {
			cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( cartItemForPremiumPlan );
		} );

		it( 'Remove WordPress.com Premium from cart', async function () {
			await cartCheckoutPage.removeCartItem( cartItemForPremiumPlan );
		} );

		it( 'Automatically return to Plans page', async function () {
			plansPage = new PlansPage( page );
			await plansPage.validateActiveNavigationTab( 'Plans' );
		} );
	} );

	describe( 'Manage current plan (WordPress.com Business)', function () {
		const cartItemForBusinessPlan = 'WordPress.com Business';

		it( 'Click on "Upgrade" button for WordPress.com Business plan', async function () {
			await plansPage.clickPlanActionButton( { plan: 'Business', buttonText: 'Upgrade' } );
		} );

		it( 'WordPress.com Business is added to cart', async function () {
			cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( cartItemForBusinessPlan );
		} );

		it( 'Remove WordPress.com Business from cart', async function () {
			await cartCheckoutPage.removeCartItem( cartItemForBusinessPlan );
		} );

		it( 'Automatically return to Plans page', async function () {
			plansPage = new PlansPage( page );
			await plansPage.validateActiveNavigationTab( 'Plans' );
		} );
	} );
} );
