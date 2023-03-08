/**
 * @group calypso-pr
 */

import {
	DataHelper,
	PlansPage,
	CartCheckoutPage,
	TestAccount,
	BrowserManager,
	SecretsManager,
	RestAPIClient,
	MyHomePage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'My Home: Domain upsell' ), function () {
	let cartCheckoutPage: CartCheckoutPage;
	let plansPage: PlansPage;
	let myHomePage: MyHomePage;
	let selectedDomain: string;
	let page: Page;
	const credentials = SecretsManager.secrets.testAccounts.simpleSiteFreePlanUser;
	const siteId = credentials.testSites?.primary?.id as number;

	beforeAll( async function () {
		// Launch browser.
		page = await browser.newPage();

		// Authenticate as simpleSiteFreePlanUser.
		const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
		await testAccount.authenticate( page );
		await BrowserManager.setStoreCookie( page );

		const restApiClient = new RestAPIClient( credentials );
		try {
			// Make sure the shopping cart is empty before we start!
			const response = await restApiClient.clearShoppingCart( siteId );
			if ( ! response.success ) {
				console.error( 'Failed to clear the shopping cart, the test may not run as expected.' );
			}
		} catch {
			console.error( 'Failed to clear the shopping cart, the test may not run as expected.' );
		}
	} );

	it( 'Navigate to my home page', async function () {
		myHomePage = new MyHomePage( page );
	} );

	it( 'Check Domain Upsell Exists', async function () {
		await myHomePage.validateDomainUpsell();
	} );

	it( 'Get available domain', async function () {
		selectedDomain = await myHomePage.suggestedDomainName();
	} );

	it( 'Buy suggested domain', async function () {
		await myHomePage.clickBuySuggestedDomain( 'Buy this domain' );
	} );

	it( 'View available plans', async function () {
		plansPage = new PlansPage( page );
	} );

	it( 'Click button to skip plan', async function () {
		await plansPage.clickSkipPlanActionButton( 'Or continue with the free plan.' );
	} );

	it( 'Continue to checkout without a plan', async function () {
		await plansPage.clickSkipPlanConfirmButton( 'That works for me' );
	} );

	it( 'Check only one item on checkout', async function () {
		cartCheckoutPage = new CartCheckoutPage( page );
		await cartCheckoutPage.validateCartItemsCount( 1 );
	} );

	it( 'Domain is added to the cart', async function () {
		cartCheckoutPage = new CartCheckoutPage( page );
		await cartCheckoutPage.validateCartItem( selectedDomain );
	} );
} );
