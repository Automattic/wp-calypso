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
import RegistrationUnavailableComponent from '../../lib/components/domain-registration-unavailable-component';
import SecurePaymentComponent from '../../lib/components/secure-payment-component.js';
import ShoppingCartWidgetComponent from '../../lib/components/shopping-cart-widget-component.js';
import SidebarComponent from '../../lib/components/sidebar-component.js';
import MyOwnDomainPage from '../../lib/pages/domain-my-own-page';
import MapADomainPage from '../../lib/pages/domain-map-page';
import EnterADomainComponent from '../../lib/components/enter-a-domain-component';

import LoginFlow from '../../lib/flows/login-flow.js';

import * as SlackNotifier from '../../lib/slack-notifier';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const domainsInboxId = config.get( 'domainsInboxId' );
const host = dataHelper.getJetpackHost();

/**
 * This test adds domains to the shopping cart, assert their status and try to clean them up. The problem is
 * the shopping carg is per-site, so all test runs will share the same shopping cart. It causes
 * this test to be flaky when run in parallel.
 */
describe.skip( `[${ host }] Managing Domains: (${ screenSize }) @parallel`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Adding a domain to an existing site', function () {
		const blogName = dataHelper.getNewBlogName();
		const domainEmailAddress = dataHelper.getEmailAddress( blogName, domainsInboxId );
		const expectedDomainName = blogName + '.com';
		const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( domainEmailAddress );

		before( async function () {
			if ( process.env.SKIP_DOMAIN_TESTS === 'true' ) {
				await SlackNotifier.warn(
					'Domains tests are currently disabled as SKIP_DOMAIN_TESTS is set to true',
					{ suppressDuplicateMessages: true }
				);
				return this.skip();
			}
		} );

		it( 'Log In and Select Domains', async function () {
			return await new LoginFlow( this.driver, 'gutenbergSimpleSiteUser' ).loginAndSelectDomains();
		} );

		it( 'Can see the Domains page and choose add a domain', async function () {
			const domainsPage = await DomainsPage.Expect( this.driver );
			await domainsPage.waitForPage();
			await domainsPage.clickAddDomain();
			await domainsPage.popOverMenuDisplayed();
			return await domainsPage.clickPopoverItem( 'to this site' );
		} );

		it( 'Can see the domain search component', async function () {
			let findADomainComponent;
			try {
				findADomainComponent = await FindADomainComponent.Expect( this.driver );
			} catch ( err ) {
				if ( await RegistrationUnavailableComponent.Expect( this.driver ) ) {
					await SlackNotifier.warn( 'SKIPPING: Domain registration is currently unavailable. ', {
						suppressDuplicateMessages: true,
					} );
					return this.skip();
				}
			}
			return await findADomainComponent.waitForResults();
		} );

		it( 'Can search for a blog name', async function () {
			const findADomainComponent = await FindADomainComponent.Expect( this.driver );
			// Search for the full blog name including the .com, as the default TLD suggestion is not always .com.
			return await findADomainComponent.searchForBlogNameAndWaitForResults( expectedDomainName );
		} );

		it( 'Can select the .com search result and decline Google Apps for email', async function () {
			const findADomainComponent = await FindADomainComponent.Expect( this.driver );
			await findADomainComponent.selectDomainAddress( expectedDomainName );
			return await findADomainComponent.declineGoogleApps();
		} );

		it( 'Can see checkout page and enter registrar details', async function () {
			const checkOutPage = await CheckOutPage.Expect( this.driver );
			await checkOutPage.enterRegistrarDetails( testDomainRegistarDetails );
			return await checkOutPage.submitForm();
		} );

		it( 'Can then see secure payment component', async function () {
			await SecurePaymentComponent.Expect( this.driver );
		} );

		it( 'Can close the checkout page', async function () {
			const checkOutPage = await CheckOutPage.Expect( this.driver );
			await checkOutPage.close();
		} );

		it( 'Can remove added item from cart', async function () {
			const sidebarComponent = await SidebarComponent.Expect( this.driver );
			await sidebarComponent.selectDomains();
			const shoppingCartWidgetComponent = await ShoppingCartWidgetComponent.Expect( this.driver );
			await shoppingCartWidgetComponent.removeDomainRegistration( expectedDomainName );
		} );
	} );

	describe( 'Map a domain to an existing site', function () {
		const blogName = 'nature.com';

		before( async function () {
			if ( process.env.SKIP_DOMAIN_TESTS === 'true' ) {
				await SlackNotifier.warn(
					'Domains tests are currently disabled as SKIP_DOMAIN_TESTS is set to true',
					{ suppressDuplicateMessages: true }
				);
				return this.skip();
			}
		} );

		it( 'Log In and Select Domains', async function () {
			return await new LoginFlow( this.driver, 'gutenbergSimpleSiteUser' ).loginAndSelectDomains();
		} );

		it( 'Can see the Domains page and choose add a domain', async function () {
			const domainsPage = await DomainsPage.Expect( this.driver );
			await domainsPage.waitForPage();
			await domainsPage.clickAddDomain();
			await domainsPage.popOverMenuDisplayed();
			return await domainsPage.clickPopoverItem( 'to this site' );
		} );

		it( 'Can see the domain search component', async function () {
			let findADomainComponent;
			try {
				findADomainComponent = await FindADomainComponent.Expect( this.driver );
			} catch ( err ) {
				if ( await RegistrationUnavailableComponent.Expect( this.driver ) ) {
					await SlackNotifier.warn( 'SKIPPING: Domain registration is currently unavailable. ', {
						suppressDuplicateMessages: true,
					} );
					return this.skip();
				}
			}
			return await findADomainComponent.waitForResults();
		} );

		it( 'Can select to use an existing domain', async function () {
			const findADomainComponent = await FindADomainComponent.Expect( this.driver );
			return await findADomainComponent.selectUseOwnDomain();
		} );

		it( 'Can see use my own domain page', async function () {
			return await MyOwnDomainPage.Expect( this.driver );
		} );

		it( 'Can select to buy domain mapping', async function () {
			const myOwnDomainPage = await MyOwnDomainPage.Expect( this.driver );
			return await myOwnDomainPage.selectBuyDomainMapping();
		} );

		it( 'Can see enter a domain component', async function () {
			return await MapADomainPage.Expect( this.driver );
		} );

		it( 'Can enter the domain name', async function () {
			const enterADomainComponent = await EnterADomainComponent.Expect( this.driver );
			return await enterADomainComponent.enterADomain( blogName );
		} );
	} );
} );
