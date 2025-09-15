/**
 * @group calypso-release
 */

import {
	DataHelper,
	BrowserManager,
	RewrittenDomainSearchComponent,
	CartCheckoutPage,
	RestAPIClient,
	TestAccount,
	SecretsManager,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'Domain flow: Purchase a domain for a pre-selected paid site' ),
	function () {
		let page: Page;
		let selectedDomain: string;
		const testAccountName = 'atomicUser';
		const testAccountUser = SecretsManager.secrets.testAccounts[ testAccountName ];
		const testAccount = new TestAccount( testAccountName );
		let restAPIClient: RestAPIClient;

		beforeAll( async () => {
			page = await browser.newPage();
			await BrowserManager.setStoreCookie( page, { currency: 'USD' } );

			await testAccount.authenticate( page );

			restAPIClient = new RestAPIClient( testAccount.credentials );
			await restAPIClient.clearMyShoppingCart( testAccountUser.testSites?.primary?.id as number );
		} );

		it( 'Enter the flow', async function () {
			const flowUrl = DataHelper.getCalypsoURL(
				`/setup/domain?siteSlug=${ testAccountUser.testSites?.primary?.url as string }`
			);

			await page.goto( flowUrl );
		} );

		it( 'Search for a domain', async function () {
			const domainSearchComponent = new RewrittenDomainSearchComponent( page );
			await domainSearchComponent.search( 'example' );
		} );

		it( 'Add the first suggestion to the cart', async function () {
			const domainSearchComponent = new RewrittenDomainSearchComponent( page );
			selectedDomain = await domainSearchComponent.selectFirstSuggestion();
		} );

		it( 'Continue to next step', async function () {
			const domainSearchComponent = new RewrittenDomainSearchComponent( page );
			await domainSearchComponent.continue();
		} );

		it( 'See domain at checkout', async function () {
			const cartCheckoutPage = new CartCheckoutPage( page );

			await cartCheckoutPage.validateCartItem( selectedDomain );
		} );
	}
);
