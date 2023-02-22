/**
 * @group calypso-pr
 */

import {
	DataHelper,
	DomainSearchComponent,
	SidebarComponent,
	PlansPage,
	CartCheckoutPage,
	TestAccount,
	BrowserManager,
	SecretsManager,
	NavbarCartComponent,
} from '@automattic/calypso-e2e';
import { Page, Browser, Response } from 'playwright';

declare const browser: Browser;

interface CartResponsePayload {
	body: {
		products: unknown[];
	};
}

async function cartHasItems( cartReponse: Response ): Promise< boolean > {
	if ( ! cartReponse.ok() ) {
		return false;
	}

	const cartResponsePayload = ( await cartReponse.json() ) as CartResponsePayload;
	return cartResponsePayload.body.products.length > 0;
}

describe( DataHelper.createSuiteTitle( 'Sidebar: Domain upsell' ), function () {
	const planName = 'Premium';
	let domainSearchComponent: DomainSearchComponent;
	let cartCheckoutPage: CartCheckoutPage;
	let plansPage: PlansPage;
	let sidebarComponent: SidebarComponent;
	let navbarCartComponent: NavbarCartComponent;
	let selectedDomain: string;
	let page: Page;
	const credentials = SecretsManager.secrets.testAccounts.simpleSiteFreePlanUser;
	const siteSlug = credentials.testSites?.primary?.url as string;
	const blogName = credentials.username as string;

	let cartResponse: Response;

	beforeAll( async function () {
		// Launch browser.
		page = await browser.newPage();

		// Authenticate as simpleSiteFreePlanUser.
		const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
		await testAccount.authenticate( page );
		await BrowserManager.setStoreCookie( page );
	} );

	it( 'Navigate to Home', async function () {
		// We are want to capture the shopping cart load request so we can check if it has items.
		// So we start listening for it before the navigation.
		const cartResponsePromise = page.waitForResponse( /me\/shopping-cart/ );
		await page.goto( DataHelper.getCalypsoURL( `/home/${ siteSlug }` ) );
		cartResponse = await cartResponsePromise;
	} );

	it( 'If required, clear the cart', async function () {
		navbarCartComponent = new NavbarCartComponent( page );
		// Checking the API response is the most reliable way to know if we have cart items.
		// If we know we do, we can wait without risk until the cart icon is finally rendered.
		if ( await cartHasItems( cartResponse ) ) {
			await navbarCartComponent.openCart();
			await navbarCartComponent.emptyCart();
		}
	} );

	it( 'Click Claim on the sidebar Domain Upsell', async function () {
		sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.openNotice(
			'Upgrade',
			`**/domains/add/${ siteSlug }?domainAndPlanPackage=true`
		);
	} );

	it( 'Search for a domain name', async function () {
		domainSearchComponent = new DomainSearchComponent( page );
		await domainSearchComponent.search( blogName + '.live' );
	} );

	it( 'Choose the .live TLD', async function () {
		selectedDomain = await domainSearchComponent.selectDomain( '.live' );
	} );

	it( 'View available plans', async function () {
		plansPage = new PlansPage( page );
	} );

	it( `Click button to upgrade to WordPress.com ${ planName }`, async function () {
		await plansPage.selectPlan( 'Premium' );
	} );

	it( `WordPress.com ${ planName } is added to cart`, async function () {
		cartCheckoutPage = new CartCheckoutPage( page );
		await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
	} );

	it( 'See secure payment', async function () {
		cartCheckoutPage = new CartCheckoutPage( page );
		await cartCheckoutPage.validateCartItem( selectedDomain );
	} );
} );
