/**
 * @group calypso-release
 */

import {
	DataHelper,
	BrowserManager,
	RewrittenDomainSearchComponent,
	SelectItemsComponent,
	CartCheckoutPage,
	RestAPIClient,
	TestAccount,
	SignupPickPlanPage,
	SiteSelectComponent,
	SecretsManager,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'Domain flow: Purchase a domain for an existing free site' ),
	function () {
		const planName = 'Personal';
		let page: Page;
		let selectedDomain: string;
		const testAccountName = 'siteEditorSimpleSiteUser';
		const testAccountUser = SecretsManager.secrets.testAccounts[ testAccountName ];
		const testAccount = new TestAccount( testAccountName );
		let restAPIClient: RestAPIClient;

		beforeAll( async () => {
			page = await browser.newPage();
			await BrowserManager.setStoreCookie( page, { currency: 'USD' } );

			await testAccount.authenticate( page );

			restAPIClient = new RestAPIClient( testAccount.credentials );
			await restAPIClient.clearMyShoppingCart( 'no-site' );
		} );

		it( 'Enter the flow', async function () {
			const flowUrl = DataHelper.getCalypsoURL( '/setup/domain' );

			await page.goto( flowUrl );
		} );

		it( 'Search for a domain', async function () {
			const domainSearchComponent = new RewrittenDomainSearchComponent( page );
			await domainSearchComponent.search( DataHelper.getBlogName() );
		} );

		it( 'Add the first suggestion to the cart', async function () {
			const domainSearchComponent = new RewrittenDomainSearchComponent( page );
			selectedDomain = await domainSearchComponent.selectFirstSuggestion();
		} );

		it( 'Continue to next step', async function () {
			const domainSearchComponent = new RewrittenDomainSearchComponent( page );
			await domainSearchComponent.continue();
		} );

		it( 'Select existing site option', async function () {
			const domainSearchComponent = new SelectItemsComponent( page );
			await domainSearchComponent.clickButton( 'Existing WordPress.com site', 'Select a site' );
		} );

		it( 'Select the site', async function () {
			const siteSelectComponent = new SiteSelectComponent( page );
			await siteSelectComponent.selectSite(
				testAccountUser.testSites?.primary?.url as string,
				false
			);
		} );

		it( `Select ${ planName } plan`, async function () {
			const plansPage = new SignupPickPlanPage( page );

			await Promise.all( [
				plansPage.selectPlan( planName ),
				page.waitForURL( /.*\/checkout\/.*/, { timeout: 30 * 1000 } ),
			] );
		} );

		it( 'See plan and domain at checkout', async function () {
			const cartCheckoutPage = new CartCheckoutPage( page );

			await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
			await cartCheckoutPage.validateCartItem( selectedDomain );
		} );
	}
);
