/**
 * @group calypso-release
 */

import {
	DataHelper,
	BrowserManager,
	LoginFlow,
	DomainsPage,
	SidebarComponent,
	DomainSearchComponent,
	setupHooks,
	CartCheckoutPage,
	IndividualPurchasePage,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Domains: Add to current site' ), function () {
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	const blogName = DataHelper.getBlogName();

	let sidebarComponent: SidebarComponent;
	let domainSearchComponent: DomainSearchComponent;
	let cartCheckoutPage: CartCheckoutPage;
	let selectedDomain: string;
	let domainsPage: DomainsPage;

	it( 'Log in', async function () {
		const loginFlow = new LoginFlow( page, 'calypsoPreReleaseUser' );
		await loginFlow.logIn();
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
		const cartOpened = await domainsPage.openCart();
		if ( cartOpened ) {
			await domainsPage.removeCartItem( { all: true } );
		}
	} );

	it( 'Add domain to site', async function () {
		await domainsPage.addDomain();
	} );

	it( 'Search for a domain name', async function () {
		domainSearchComponent = new DomainSearchComponent( page );
		await domainSearchComponent.search( blogName + '.live' );
	} );

	it( 'Choose the .live TLD', async function () {
		selectedDomain = await domainSearchComponent.selectDomain( '.live' );
	} );

	it( 'Decline Titan Email upsell', async function () {
		await domainSearchComponent.clickButton( 'Skip' );
	} );

	it( 'See secure payment', async function () {
		cartCheckoutPage = new CartCheckoutPage( page );
		await cartCheckoutPage.validateCartItem( selectedDomain );
	} );

	it( 'Make purchase', async function () {
		await cartCheckoutPage.purchase();
	} );

	it( 'Manage domain', async function () {
		await page.click( 'button:text("Manage domain")' );
	} );

	it( 'Cancel domain', async function () {
		const individualPurchasePage = new IndividualPurchasePage( page );
		await individualPurchasePage.deleteDomain();
	} );
} );
