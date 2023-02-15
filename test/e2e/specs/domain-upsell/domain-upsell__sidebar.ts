/**
 * @group calypso-release
 */

import {
	DataHelper,
	DomainSearchComponent,
	SidebarComponent,
	PlansPage,
	CartCheckoutPage,
	TestAccount,
	RestAPIClient,
	BrowserManager,
	SecretsManager,
	NewSiteResponse,
	NavbarCartComponent,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiDeleteSite } from '../shared';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle(
		'Domain Upsell: Click on the sidebar Domain Upsell, search for a domain, select the Premium plan and check both items on the checkout page'
	),
	function () {
		const blogName = DataHelper.getBlogName();
		const planName = 'Premium';
		let siteCreatedFlag: boolean;
		let newSiteDetails: NewSiteResponse;
		let domainSearchComponent: DomainSearchComponent;
		let cartCheckoutPage: CartCheckoutPage;
		let plansPage: PlansPage;
		let sidebarComponent: SidebarComponent;
		let navbarCartComponent: NavbarCartComponent;
		let selectedDomain: string;
		let restAPIClient: RestAPIClient;
		let page: Page;

		beforeAll( async function () {
			// Set up the test site programmatically against simpleSiteFreePlanUser.
			const credentials = SecretsManager.secrets.testAccounts.simpleSiteFreePlanUser;

			restAPIClient = new RestAPIClient( credentials );
			console.info( 'Creating a new test site.' );
			newSiteDetails = await restAPIClient.createSite( {
				name: blogName,
				title: blogName,
			} );
			console.info( `New site created: ${ newSiteDetails.blog_details.url }` );
			siteCreatedFlag = true;

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
				await page.goto(
					DataHelper.getCalypsoURL( `/home/${ newSiteDetails.blog_details.site_slug }` )
				);
			} );

			it( 'Click Claim on the sidebar Domain Upsell', async function () {
				sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.openNotice(
					'Upgrade',
					`**/domains/add/${ newSiteDetails.blog_details.site_slug }?domainAndPlanPackage=true`
				);
			} );

			it( 'If required, clear the cart', async function () {
				navbarCartComponent = new NavbarCartComponent( page );
				const cartOpened = await navbarCartComponent.openCart();
				// The cart popover existing implies there are some items that need to be removed.
				if ( cartOpened ) {
					await navbarCartComponent.emptyCart();
				}
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

		afterAll( async function () {
			if ( ! siteCreatedFlag ) {
				return;
			}

			await apiDeleteSite( restAPIClient, {
				url: newSiteDetails.blog_details.url,
				id: newSiteDetails.blog_details.blogid,
				name: newSiteDetails.blog_details.blogname,
			} );
		} );
	}
);
