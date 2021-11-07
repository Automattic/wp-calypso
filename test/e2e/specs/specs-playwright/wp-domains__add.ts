/**
 * @group calypso-release
 */

import {
	DataHelper,
	BrowserManager,
	LoginPage,
	DomainsPage,
	SidebarComponent,
	DomainSearchComponent,
	setupHooks,
	CartCheckoutPage,
	IndividualPurchasePage,
	NavbarComponent,
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
		const loginPage = new LoginPage( page );
		await loginPage.login( { account: 'calypsoPreReleaseUser' } );
	} );

	it( 'Set store cookie', async function () {
		await BrowserManager.setStoreCookie( page );
	} );

	describe( 'Purchase domain', function () {
		it( 'Navigate to Upgrades > Domains', async function () {
			sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Upgrades', 'Domains' );
		} );

		it( 'If required, clear the cart', async function () {
			domainsPage = new DomainsPage( page );
			const cartOpened = await domainsPage.openCart();
			// The cart popover existing implies there are some items that need to be removed.
			if ( cartOpened ) {
				await domainsPage.emptyCart();
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
			await Promise.all( [
				page.waitForNavigation( {
					url: '**/checkout/thank-you/**',
					waitUntil: 'networkidle',
					// Sometimes the testing domain third party system is really slow. It's better to wait a while than to throw a false positive.
					timeout: 90 * 1000,
				} ),
				cartCheckoutPage.purchase( { timeout: 120 * 1000 } ),
			] );
		} );
	} );

	describe( 'Cancel domain', function () {
		it( 'Return to Home dashboard', async function () {
			const navbarComponent = new NavbarComponent( page );
			await navbarComponent.clickMySites();
		} );

		it( 'Navigate to Upgrades > Domains', async function () {
			sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Upgrades', 'Domains' );
		} );

		it( 'Click on purchased domain', async function () {
			const domainsPage = new DomainsPage( page );
			await domainsPage.click( selectedDomain );
		} );

		it( 'Cancel domain', async function () {
			const individualPurchasePage = new IndividualPurchasePage( page );
			await individualPurchasePage.deleteDomain();
		} );
	} );
} );
