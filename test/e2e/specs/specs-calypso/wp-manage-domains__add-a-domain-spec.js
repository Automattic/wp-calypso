/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper.js';

import CreateSiteFlow from '../../lib/flows/create-site-flow.js';
import DeleteSiteFlow from '../../lib/flows/delete-site-flow.js';
import DomainsPage from '../../lib/pages/domains-page.js';
import CheckOutPage from '../../lib/pages/signup/checkout-page.js';
import FindADomainComponent from '../../lib/components/find-a-domain-component.js';
import SecurePaymentComponent from '../../lib/components/secure-payment-component.js';
import SidebarComponent from '../../lib/components/sidebar-component.js';
import LoginFlow from '../../lib/flows/login-flow.js';

const screenSize = driverManager.currentScreenSize();
const domainsInboxId = config.get( 'domainsInboxId' );
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Manage Domains - Add a Domain: (${ screenSize }) @parallel`, function () {
	let driver;

	beforeAll( () => ( driver = global.__BROWSER__ ) );

	const tmpFreeSiteName = dataHelper.getNewBlogName();
	const domainName = dataHelper.getNewBlogName();
	const topLevelDomain = '.com';
	const rootDomain = domainName + topLevelDomain;
	const domainEmail = dataHelper.getEmailAddress( domainName, domainsInboxId );
	const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( domainEmail );

	let tmpFreeSiteCreated = false;

	beforeAll( async function () {
		await new LoginFlow( driver ).login();
		await new CreateSiteFlow( driver, tmpFreeSiteName ).createFreeSite();
		tmpFreeSiteCreated = true;
		const sideBarComponent = await SidebarComponent.Expect( driver );
		await sideBarComponent.selectDomains();
	} );

	afterAll( async function () {
		if ( tmpFreeSiteCreated ) {
			const deleteSite = new DeleteSiteFlow( driver );
			await deleteSite.deleteSite( tmpFreeSiteName + '.wordpress.com' );
		}
	} );

	it( 'Add a domain', async function () {
		const domainsPage = await DomainsPage.Expect( driver );
		await domainsPage.clickAddDomain();
		await domainsPage.clickPopoverItem( 'to this site' );
	} );

	it( 'Search for a blog name', async function () {
		const findADomainComponent = await FindADomainComponent.Expect( driver );
		// Search for the full blog name including the .com, as the default TLD suggestion is not
		// always .com
		await findADomainComponent.searchForBlogNameAndWaitForResults( rootDomain );
	} );

	it( 'Select .com search result and decline Google Apps offer', async function () {
		const findADomainComponent = await FindADomainComponent.Expect( driver );
		await findADomainComponent.selectDomainAddress( rootDomain );
		await findADomainComponent.declineGoogleApps();
	} );

	it( 'Go to checkout page and enter registrar details', async function () {
		const checkOutPage = await CheckOutPage.Expect( driver );
		await checkOutPage.enterRegistrarDetails( testDomainRegistarDetails );
		await checkOutPage.submitForm();
	} );

	it( 'See the Secure Payment', async function () {
		await SecurePaymentComponent.Expect( driver );
	} );

	it( 'Close the checkout page', async function () {
		const checkOutPage = await CheckOutPage.Expect( driver );
		await checkOutPage.close();
	} );
} );
