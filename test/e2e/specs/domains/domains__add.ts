/**
 * @group calypso-release
 */

import {
	DataHelper,
	BrowserManager,
	DomainsPage,
	SidebarComponent,
	DomainSearchComponent,
	CartCheckoutPage,
	NavbarCartComponent,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Domains: Add to current site' ), function () {
	let page: Page;
	let sidebarComponent: SidebarComponent;
	let domainSearchComponent: DomainSearchComponent;
	let cartCheckoutPage: CartCheckoutPage;
	let navbarCartComponent: NavbarCartComponent;
	let selectedDomain: string;
	let domainsPage: DomainsPage;

	beforeAll( async () => {
		page = await browser.newPage();
		const testAccount = new TestAccount( 'calypsoPreReleaseUser' );
		await testAccount.authenticate( page );
	} );

	it( 'Set store cookie', async function () {
		await BrowserManager.setStoreCookie( page );
	} );

	it( 'Navigate to Upgrades > Domains', async function () {
		sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Upgrades', 'Domains' );
	} );

	it( 'If required, clear the cart', async function () {
		domainsPage = new DomainsPage( page );
		navbarCartComponent = new NavbarCartComponent( page );

		// Only attempt to clear the cart if the cart has items
		if ( await navbarCartComponent.isCartButtonVisible() ) {
			await navbarCartComponent.openCart();
			await navbarCartComponent.emptyCart();
		}
	} );

	it( 'Add domain to site', async function () {
		await domainsPage.addDomain();
	} );

	it( 'Choose the first suggestion', async function () {
		domainSearchComponent = new DomainSearchComponent( page, page.getByRole( 'main' ) );
		selectedDomain = await domainSearchComponent.selectFirstSuggestion();
	} );

	it( 'Continue to next step', async function () {
		await domainSearchComponent.continue();
	} );

	it( 'Decline Titan Email upsell', async function () {
		await page.getByRole( 'main' ).getByRole( 'button', { name: 'Skip' } ).click();
	} );

	it( 'See domain at checkout', async function () {
		cartCheckoutPage = new CartCheckoutPage( page );
		await cartCheckoutPage.validateCartItem( selectedDomain );
	} );

	it( 'Remove domain from cart', async function () {
		await cartCheckoutPage.removeCartItem( selectedDomain, false );
	} );
} );
