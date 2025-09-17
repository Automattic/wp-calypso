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
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Domain flow: Purchase only a domain' ), function () {
	let page: Page;
	let selectedDomain: string;
	const testAccount = new TestAccount( 'defaultUser' );

	beforeAll( async () => {
		page = await browser.newPage();
		await BrowserManager.setStoreCookie( page, { currency: 'USD' } );

		await testAccount.authenticate( page );

		const restAPIClient = new RestAPIClient( testAccount.credentials );
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

	it( 'Select domain only option', async function () {
		const domainSearchComponent = new SelectItemsComponent( page );
		await domainSearchComponent.clickButton( 'Just buy a domain', 'Continue' );
	} );

	it( 'See domain at checkout', async function () {
		const cartCheckoutPage = new CartCheckoutPage( page );

		await cartCheckoutPage.validateCartItem( selectedDomain );
	} );
} );
