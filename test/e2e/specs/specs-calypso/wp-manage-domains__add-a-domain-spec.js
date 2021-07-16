import config from 'config';
import FindADomainComponent from '../../lib/components/find-a-domain-component.js';
import SecurePaymentComponent from '../../lib/components/secure-payment-component.js';
import SidebarComponent from '../../lib/components/sidebar-component.js';
import * as dataHelper from '../../lib/data-helper.js';
import * as driverManager from '../../lib/driver-manager.js';
import CreateSiteFlow from '../../lib/flows/create-site-flow.js';
import DeleteSiteFlow from '../../lib/flows/delete-site-flow.js';
import LoginFlow from '../../lib/flows/login-flow.js';
import DomainsPage from '../../lib/pages/domains-page.js';
import CheckOutPage from '../../lib/pages/signup/checkout-page.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const domainsInboxId = config.get( 'domainsInboxId' );
const host = dataHelper.getJetpackHost();

describe.skip( `[${ host }] Manage Domains - Add a Domain: (${ screenSize }) @parallel`, function () {
	this.timeout( mochaTimeOut );

	const tmpFreeSiteName = dataHelper.getNewBlogName();
	const domainName = dataHelper.getNewBlogName();
	const topLevelDomain = '.com';
	const rootDomain = domainName + topLevelDomain;
	const domainEmail = dataHelper.getEmailAddress( domainName, domainsInboxId );
	const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( domainEmail );

	let tmpFreeSiteCreated = false;

	before( 'Log in, create a temp free site and go to Domains page', async function () {
		await new LoginFlow( this.driver ).login();
		await new CreateSiteFlow( this.driver, tmpFreeSiteName ).createFreeSite();
		tmpFreeSiteCreated = true;
		const sideBarComponent = await SidebarComponent.Expect( this.driver );
		await sideBarComponent.selectDomains();
	} );

	after( 'Delete the temp free site', async function () {
		if ( tmpFreeSiteCreated ) {
			const deleteSite = new DeleteSiteFlow( this.driver );
			await deleteSite.deleteSite( tmpFreeSiteName + '.wordpress.com' );
		}
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
		await findADomainComponent.searchForBlogNameAndWaitForResults( rootDomain );
	} );

	it( 'Select .com search result and decline Google Apps offer', async function () {
		const findADomainComponent = await FindADomainComponent.Expect( this.driver );
		await findADomainComponent.selectDomainAddress( rootDomain );
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
} );
