/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper.js';

import DomainsPage from '../../lib/pages/domains-page.js';
import CheckOutPage from '../../lib/pages/signup/checkout-page.js';

import FindADomainComponent from '../../lib/components/find-a-domain-component.js';
import SecurePaymentComponent from '../../lib/components/secure-payment-component.js';
import ShoppingCartWidgetComponent from '../../lib/components/shopping-cart-widget-component.js';
import SidebarComponent from '../../lib/components/sidebar-component.js';
import MyOwnDomainPage from '../../lib/pages/domain-my-own-page';
import EnterADomainComponent from '../../lib/components/enter-a-domain-component';

import LoginFlow from '../../lib/flows/login-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const domainsInboxId = config.get( 'domainsInboxId' );
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Managing Domains: (${ screenSize }) @parallel`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Add a domain to an existing site', function () {
		const blogName = dataHelper.getNewBlogName();
		const domainEmailAddress = dataHelper.getEmailAddress( blogName, domainsInboxId );
		const expectedDomainName = blogName + '.com';
		const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( domainEmailAddress );

		it( 'Log in and go to Domains page', async function () {
			const loginFlow = new LoginFlow( this.driver, 'gutenbergSimpleSiteUser' );
			await loginFlow.loginAndSelectDomains();
		} );

		it( 'Add a domain', async function () {
			const domainsPage = await DomainsPage.Expect( this.driver );
			await domainsPage.clickAddDomain();
			await domainsPage.clickPopoverItem( 'to this site' );
		} );

		it( 'Search for a blog name', async function () {
			const findADomainComponent = await FindADomainComponent.Expect( this.driver );
			// Search for the full blog name including the .com, as the default TLD suggestion is not
			// always .com
			await findADomainComponent.searchForBlogNameAndWaitForResults( expectedDomainName );
		} );

		it( 'Select .com search result and decline Google Apps offer', async function () {
			const findADomainComponent = await FindADomainComponent.Expect( this.driver );
			await findADomainComponent.selectDomainAddress( expectedDomainName );
			await findADomainComponent.declineGoogleApps();
		} );

		it( 'Go to checkout page and enter registrar details', async function () {
			const checkOutPage = await CheckOutPage.Expect( this.driver );
			await checkOutPage.enterRegistrarDetails( testDomainRegistarDetails );
			await checkOutPage.submitForm();
		} );

		it( 'See the Secure Payment', async function () {
			await SecurePaymentComponent.Expect( this.driver );
		} );

		it( 'Close the checkout page', async function () {
			const checkOutPage = await CheckOutPage.Expect( this.driver );
			await checkOutPage.close();
		} );

		it( 'Remove added domain from cart', async function () {
			const sidebarComponent = await SidebarComponent.Expect( this.driver );
			await sidebarComponent.selectDomains();
			const shoppingCartWidgetComponent = await ShoppingCartWidgetComponent.Expect( this.driver );
			await shoppingCartWidgetComponent.removeDomainRegistration( expectedDomainName );
		} );
	} );

	describe( 'Map a domain to an existing site', function () {
		const blogName = 'nature.com';

		it( 'Log in and go to Domains page', async function () {
			const loginFlow = new LoginFlow( this.driver, 'gutenbergSimpleSiteUser' );
			await loginFlow.loginAndSelectDomains();
		} );

		it( 'Add a domain', async function () {
			const domainsPage = await DomainsPage.Expect( this.driver );
			await domainsPage.clickAddDomain();
			await domainsPage.clickPopoverItem( 'to this site' );
		} );

		it( 'Use own domain', async function () {
			const findADomainComponent = await FindADomainComponent.Expect( this.driver );
			await findADomainComponent.selectUseOwnDomain();
		} );

		it( 'Buy domain mapping', async function () {
			const myOwnDomainPage = await MyOwnDomainPage.Expect( this.driver );
			return await myOwnDomainPage.selectBuyDomainMapping();
		} );

		it( 'Enter domain name', async function () {
			const enterADomainComponent = await EnterADomainComponent.Expect( this.driver );
			return await enterADomainComponent.enterADomain( blogName );
		} );
	} );
} );
