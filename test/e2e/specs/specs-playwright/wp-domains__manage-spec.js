/**
 * External dependencies
 */
import config from 'config';
import {
	DataHelper,
	BrowserHelper,
	LoginFlow,
	SidebarComponent,
	DomainsPage,
	DomainsSearchComponent,
	CheckoutPage,
	CartComponent,
} from '@automattic/calypso-e2e';

/**
 * Constants
 */
const host = DataHelper.getJetpackHost();
const viewportName = BrowserHelper.getViewportName();

describe( `[${ host }] Domains (Manage): (${ viewportName }) @parallel`, function () {
	describe( 'Add domain to existing site', function () {
		let domainsSearchComponent;
		let sidebarComponent;
		let checkoutPage;

		const siteName = DataHelper.getNewBlogName();

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( this.page, 'gutenbergSimpleSiteUser' );
			await loginFlow.login();
		} );

		it( 'View domain management', async function () {
			sidebarComponent = await SidebarComponent.Expect( this.page );
			await sidebarComponent.clickMenuItem( 'Upgrades' );
			await sidebarComponent.clickMenuItem( 'Domains' );
		} );

		it( 'Click on add domain to this site', async function () {
			const domainsPage = await DomainsPage.Expect( this.page );
			await domainsPage.addDomain( { target: 'this site' } );
		} );

		it( 'Search for a domain name', async function () {
			domainsSearchComponent = await DomainsSearchComponent.Expect( this.page );
			await domainsSearchComponent.search( siteName );
		} );

		it( 'Choose the .com TLD', async function () {
			await domainsSearchComponent.selectByTld( '.com' );
		} );

		it( 'Decline G Suite upsell', async function () {
			await domainsSearchComponent.declineGSuite();
		} );

		it( 'Enter domain registration details', async function () {
			checkoutPage = await CheckoutPage.Expect( this.page );
			const inboxId = config.get( 'domainsInboxId' );
			const emailAddress = DataHelper.getTestEmailAddress( { prefix: siteName, inboxId: inboxId } );
			const registrarDetails = DataHelper.getTestDomainRegistrarDetails( { email: emailAddress } );
			await checkoutPage.enterRegistrarDetails( registrarDetails );
		} );

		it( 'See secure payment', async function () {
			await checkoutPage.viewPaymentMethods();
		} );

		it( 'Return to domain management', async function () {
			await checkoutPage.close();
			await sidebarComponent.clickMenuItem( 'Domains' );
		} );

		it( 'Remove domain from cart', async function () {
			await sidebarComponent.clickMenuItem( 'Domains' );
			const cartComponent = await CartComponent.Expect( this.page );
			await cartComponent.viewCart();
			await cartComponent.removeDomain( siteName );
		} );
	} );
} );
