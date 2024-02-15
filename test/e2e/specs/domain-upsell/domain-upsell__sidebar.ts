/**
 * @group calypso-pr
 */

import {
	DataHelper,
	DomainSearchComponent,
	PlansPage,
	CartCheckoutPage,
	TestAccount,
	BrowserManager,
	SecretsManager,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { getNewPlanName } from '../shared';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Sidebar: Domain upsell' ), function () {
	const planName = 'Premium';
	const newPlanName = getNewPlanName( planName );
	let domainSearchComponent: DomainSearchComponent;
	let cartCheckoutPage: CartCheckoutPage;
	let plansPage: PlansPage;
	let selectedDomain: string;
	let page: Page;
	let testAccount: TestAccount;
	const credentials = SecretsManager.secrets.testAccounts.simpleSiteFreePlanUser;
	const siteSlug = credentials.testSites?.primary?.url as string;
	const siteId = credentials.testSites?.primary?.id as number;
	const blogName = credentials.username as string;

	beforeAll( async function () {
		// Launch browser.
		page = await browser.newPage();

		// Authenticate as simpleSiteFreePlanUser.
		testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
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

	it( 'Navigate to Home', async function () {
		await page.goto( DataHelper.getCalypsoURL( `/home/${ siteSlug }` ) );
	} );

	it( 'Click Claim on the sidebar Domain Upsell', async function () {
		/**
		 * Temporarily disabled sidebar code due to the Untangling Calypso & Nav Redesign project.
		 * Awaiting final UI design.
		 * @see https://github.com/Automattic/wp-calypso/pull/87477
		 */
		page.goto(
			DataHelper.getCalypsoURL( `domains/add/${ testAccount.getSiteURL( { protocol: false } ) }` )
		);
		// sidebarComponent = new SidebarComponent( page );
		// await sidebarComponent.openNotice(
		// 	'Upgrade',
		// 	`**/domains/add/${ siteSlug }?domainAndPlanPackage=true`
		// );
	} );

	it( 'Search for a domain name', async function () {
		domainSearchComponent = new DomainSearchComponent( page );
		await domainSearchComponent.search( blogName + '.com' );
	} );

	it( 'Choose the the first suggestion', async function () {
		selectedDomain = await domainSearchComponent.selectFirstSuggestion();
	} );

	it( 'View available plans', async function () {
		plansPage = new PlansPage( page );
	} );

	it( `Click button to upgrade to WordPress.com ${ newPlanName }`, async function () {
		await plansPage.selectPlan( planName );
	} );

	it( `WordPress.com ${ newPlanName } is added to cart`, async function () {
		cartCheckoutPage = new CartCheckoutPage( page );
		await cartCheckoutPage.validateCartItem( `WordPress.com ${ newPlanName }` );
	} );

	it( 'See secure payment', async function () {
		cartCheckoutPage = new CartCheckoutPage( page );
		await cartCheckoutPage.validateCartItem( selectedDomain );
	} );

	afterAll( async function () {
		const restAPIClient = new RestAPIClient( credentials );
		await restAPIClient.clearShoppingCart( credentials.testSites?.primary?.id as number );
	} );
} );
