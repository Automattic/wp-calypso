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
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle(
		'Domain Upsell: Click on the sidebar Domain Upsell, search for a domain, select the Premium plan and check both items on the checkout page'
	),
	function () {
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

		beforeAll( async function () {
			// Launch browser.
			page = await browser.newPage();

			// Authenticate as simpleSiteFreePlanUser.
			const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
			await testAccount.authenticate( page );
		} );

		describe( `Upgrade to WordPress.com ${ planName }`, function () {
			beforeAll( async function () {
				await BrowserManager.setStoreCookie( page );
			} );

			it( 'Navigate to Home', async function () {
				await page.goto( DataHelper.getCalypsoURL( `/home/${ siteSlug }` ) );
			} );

			it( 'If required, clear the cart', async function () {
				navbarCartComponent = new NavbarCartComponent( page );
				const cartOpened = await navbarCartComponent.openCart();
				// The cart popover existing implies there are some items that need to be removed.
				if ( cartOpened ) {
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
	}
);
