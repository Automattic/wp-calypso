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
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Domains: Add to current site' ), function () {
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	// Todo: add row for Atomic tests when once #54987 is merged to trunk.
	// ${ 'Atomic' } | ${ 'wooCommerceUser' } | ${'Free'}
	describe.each`
		siteType      | user                         | paymentMethod
		${ 'Simple' } | ${ 'calypsoPreReleaseUser' } | ${ 'Credit Card' }
	`( 'Domains: Add to current site ($siteType)', function ( { user, paymentMethod } ) {
		const phrase = DataHelper.getRandomPhrase();

		let sidebarComponent: SidebarComponent;
		let domainSearchComponent: DomainSearchComponent;
		let cartCheckoutPage: CartCheckoutPage;
		let selectedDomain: string;

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( page, user );
			await loginFlow.logIn();
		} );

		it( 'Set store cookie', async function () {
			await BrowserManager.setStoreCookie( page, { currency: 'GBP' } );
		} );

		it( 'Navigate to Upgrades > Domains', async function () {
			sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Upgrades', 'Domains' );
		} );

		it( 'Add domain to site', async function () {
			const domainsPage = new DomainsPage( page );
			await domainsPage.addDomain();
		} );

		it( 'Search for a domain name', async function () {
			domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( phrase );
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

		it( 'Enter domain registrar details', async function () {} );
	} );
} );
