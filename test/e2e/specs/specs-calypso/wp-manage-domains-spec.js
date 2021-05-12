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
import ReaderPage from '../../lib/pages/reader-page.js';

import FindADomainComponent from '../../lib/components/find-a-domain-component.js';
import RegistrationUnavailableComponent from '../../lib/components/domain-registration-unavailable-component';
import SecurePaymentComponent from '../../lib/components/secure-payment-component.js';
import ShoppingCartWidgetComponent from '../../lib/components/shopping-cart-widget-component.js';
import SidebarComponent from '../../lib/components/sidebar-component.js';
import NavBarComponent from '../../lib/components/nav-bar-component.js';
import MyOwnDomainPage from '../../lib/pages/domain-my-own-page';
import MapADomainPage from '../../lib/pages/domain-map-page';
import EnterADomainComponent from '../../lib/components/enter-a-domain-component';
import MapADomainCheckoutPage from '../../lib/pages/domain-map-checkout-page';

import LoginFlow from '../../lib/flows/login-flow.js';

import * as SlackNotifier from '../../lib/slack-notifier';

const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const domainsInboxId = config.get( 'domainsInboxId' );
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Managing Domains: (${ screenSize }) @parallel`, function () {
	let driver;

	beforeAll( async function () {
		driver = await driverManager.startBrowser();
	}, startBrowserTimeoutMS );

	describe( 'Adding a domain to an existing site', function () {
		const blogName = dataHelper.getNewBlogName();
		const domainEmailAddress = dataHelper.getEmailAddress( blogName, domainsInboxId );
		const expectedDomainName = blogName + '.com';
		const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( domainEmailAddress );

		beforeAll( async function () {
			if ( process.env.SKIP_DOMAIN_TESTS === 'true' ) {
				await SlackNotifier.warn(
					'Domains tests are currently disabled as SKIP_DOMAIN_TESTS is set to true',
					{ suppressDuplicateMessages: true }
				);
				return this.skip();
			}
		} );

		it( 'Log In and Select Domains', async function () {
			return await new LoginFlow( driver, 'gutenbergSimpleSiteUser' ).loginAndSelectDomains();
		} );

		it( 'Can see the Domains page and choose add a domain', async function () {
			const domainsPage = await DomainsPage.Expect( driver );
			await domainsPage.setABTestControlGroupsInLocalStorage();
			await domainsPage.clickAddDomain();
			await domainsPage.popOverMenuDisplayed();
			return await domainsPage.clickPopoverItem( 'to this site' );
		} );

		it( 'Can see the domain search component', async function () {
			let findADomainComponent;
			try {
				findADomainComponent = await FindADomainComponent.Expect( driver );
			} catch ( err ) {
				if ( await RegistrationUnavailableComponent.Expect( driver ) ) {
					await SlackNotifier.warn( 'SKIPPING: Domain registration is currently unavailable. ', {
						suppressDuplicateMessages: true,
					} );
					return this.skip();
				}
			}
			return await findADomainComponent.waitForResults();
		} );

		it( 'Can search for a blog name', async function () {
			const findADomainComponent = await FindADomainComponent.Expect( driver );
			// Search for the full blog name including the .com, as the default TLD suggestion is not always .com.
			return await findADomainComponent.searchForBlogNameAndWaitForResults( expectedDomainName );
		} );

		it( 'Can select the .com search result and decline Google Apps for email', async function () {
			const findADomainComponent = await FindADomainComponent.Expect( driver );
			await findADomainComponent.selectDomainAddress( expectedDomainName );
			return await findADomainComponent.declineGoogleApps();
		} );

		it( 'Can see checkout page and enter registrar details', async function () {
			const checkOutPage = await CheckOutPage.Expect( driver );
			await checkOutPage.enterRegistrarDetails( testDomainRegistarDetails );
			return await checkOutPage.submitForm();
		} );

		it( 'Can then see secure payment component', async function () {
			return await SecurePaymentComponent.Expect( driver );
		} );

		it( 'Empty the cart', async function () {
			await ReaderPage.Visit( driver );
			const navBarComponent = await NavBarComponent.Expect( driver );
			await navBarComponent.clickMySites();
			const sidebarComponent = await SidebarComponent.Expect( driver );
			await sidebarComponent.selectDomains();
			await DomainsPage.Expect( driver );
			try {
				const shoppingCartWidgetComponent = await ShoppingCartWidgetComponent.Expect( driver );
				await shoppingCartWidgetComponent.empty();
			} catch {
				console.log( 'Cart already empty' );
			}
		} );
	} );

	describe( 'Map a domain to an existing site', function () {
		const blogName = 'nature.com';

		beforeAll( async function () {
			if ( process.env.SKIP_DOMAIN_TESTS === 'true' ) {
				await SlackNotifier.warn(
					'Domains tests are currently disabled as SKIP_DOMAIN_TESTS is set to true',
					{ suppressDuplicateMessages: true }
				);
				return this.skip();
			}
		} );

		it( 'Log In and Select Domains', async function () {
			return await new LoginFlow( driver, 'gutenbergSimpleSiteUser' ).loginAndSelectDomains();
		} );

		it( 'Can see the Domains page and choose add a domain', async function () {
			const domainsPage = await DomainsPage.Expect( driver );
			await domainsPage.setABTestControlGroupsInLocalStorage();
			await domainsPage.clickAddDomain();
			await domainsPage.popOverMenuDisplayed();
			return await domainsPage.clickPopoverItem( 'to this site' );
		} );

		it( 'Can see the domain search component', async function () {
			let findADomainComponent;
			try {
				findADomainComponent = await FindADomainComponent.Expect( driver );
			} catch ( err ) {
				if ( await RegistrationUnavailableComponent.Expect( driver ) ) {
					await SlackNotifier.warn( 'SKIPPING: Domain registration is currently unavailable. ', {
						suppressDuplicateMessages: true,
					} );
					return this.skip();
				}
			}
			return await findADomainComponent.waitForResults();
		} );

		it( 'Can select to use an existing domain', async function () {
			const findADomainComponent = await FindADomainComponent.Expect( driver );
			return await findADomainComponent.selectUseOwnDomain();
		} );

		it( 'Can see use my own domain page', async function () {
			return await MyOwnDomainPage.Expect( driver );
		} );

		it( 'Can select to buy domain mapping', async function () {
			const myOwnDomainPage = await MyOwnDomainPage.Expect( driver );
			return await myOwnDomainPage.selectBuyDomainMapping();
		} );

		it( 'Can see enter a domain component', async function () {
			return await MapADomainPage.Expect( driver );
		} );

		it( 'Can enter the domain name', async function () {
			const enterADomainComponent = await EnterADomainComponent.Expect( driver );
			return await enterADomainComponent.enterADomain( blogName );
		} );

		it( 'Can add domain to the cart', async function () {
			const enterADomainComponent = await EnterADomainComponent.Expect( driver );
			return await enterADomainComponent.clickonAddButtonToAddDomainToTheCart();
		} );

		it( 'Can see checkout page', async function () {
			return await MapADomainCheckoutPage.Expect( driver );
		} );

		it( 'Empty the cart', async function () {
			await ReaderPage.Visit( driver );
			const navBarComponent = await NavBarComponent.Expect( driver );
			await navBarComponent.clickMySites();
			const sideBarComponent = await SidebarComponent.Expect( driver );
			await sideBarComponent.selectDomains();
			await DomainsPage.Expect( driver );
			try {
				const shoppingCartWidgetComponent = await ShoppingCartWidgetComponent.Expect( driver );
				await shoppingCartWidgetComponent.empty();
			} catch {
				console.log( 'Cart already empty' );
			}
		} );
	} );
} );
