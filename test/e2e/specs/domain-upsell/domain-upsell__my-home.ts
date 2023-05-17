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

	beforeAll( async function () {
		const restAPIClient = new RestAPIClient( credentials );
		await restAPIClient.clearShoppingCart( credentials.testSites?.primary?.id as number );

		page = await browser.newPage();

		await BrowserManager.setStoreCookie( page );

		const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
		await testAccount.authenticate( page );
	} );

	it( 'Navigate to my home page', async function () {
		myHomePage = new MyHomePage( page );
	} );

	it( 'Check Domain Upsell Exists', async function () {
		await myHomePage.validateDomainUpsell();
	} );

	it( 'Get available domain', async function () {
		const suggestedDomain = await myHomePage.suggestedDomainName();
		expect( suggestedDomain ).toBeTruthy();
		selectedDomain = suggestedDomain ?? '';
	} );

	it( 'Buy suggested domain', async function () {
		await myHomePage.clickBuySuggestedDomain( 'Get this domain' );
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
