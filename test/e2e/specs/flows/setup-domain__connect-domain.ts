/**
 * @group calypso-release
 */

import {
	DataHelper,
	BrowserManager,
	RewrittenDomainSearchComponent,
	SelectItemsComponent,
	CartCheckoutPage,
	RestAPIClient,
	TestAccount,
	NewSiteResponse,
	SignupPickPlanPage,
	UseADomainIOwnPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiDeleteSite } from '../shared/api-delete-site';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Domain flow: Connect a domain to a site' ), function () {
	const targetDomain = 'testwoo.com';

	const planName = 'Personal';
	let page: Page;
	const testAccount = new TestAccount( 'defaultUser' );
	let newSiteDetails: NewSiteResponse;
	let restAPIClient: RestAPIClient;

	beforeAll( async () => {
		page = await browser.newPage();
		await BrowserManager.setStoreCookie( page, { currency: 'USD' } );

		await testAccount.authenticate( page );

		restAPIClient = new RestAPIClient( testAccount.credentials );
		await restAPIClient.clearMyShoppingCart( 'no-site' );
	} );

	it( 'Enter the flow', async function () {
		const flowUrl = DataHelper.getCalypsoURL( '/setup/domain' );

		await page.goto( flowUrl );
	} );

	it( 'Search for a domain', async function () {
		const domainSearchComponent = new RewrittenDomainSearchComponent( page );
		await domainSearchComponent.search( targetDomain );
	} );

	it( 'Click the bring it over button', async function () {
		const domainSearchComponent = new RewrittenDomainSearchComponent( page );
		await domainSearchComponent.clickBringItOver();
	} );

	it( 'Click the connect button', async function () {
		const useADomainIOwnPage = new UseADomainIOwnPage( page );
		await useADomainIOwnPage.clickContinue();
		await useADomainIOwnPage.clickButtonToConnectDomain();
	} );

	it( 'Select new site option', async function () {
		const domainSearchComponent = new SelectItemsComponent( page );
		await domainSearchComponent.clickButton( 'New site', 'Create a new site' );
	} );

	it( `Select ${ planName } plan`, async function () {
		const plansPage = new SignupPickPlanPage( page );

		[ newSiteDetails ] = await Promise.all( [
			plansPage.selectPlan( planName ),
			page.waitForURL( /.*\/checkout\/.*/, { timeout: 30 * 1000 } ),
		] );
	} );

	it( 'See plan and domain connection product at checkout', async function () {
		const cartCheckoutPage = new CartCheckoutPage( page );

		await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
		await cartCheckoutPage.validateCartItem( targetDomain, 'Domain Connection' );
	} );

	afterAll( async function () {
		if ( ! newSiteDetails ) {
			return;
		}

		await apiDeleteSite( restAPIClient, {
			url: newSiteDetails.blog_details.url,
			id: newSiteDetails.blog_details.blogid,
			name: newSiteDetails.blog_details.blogname,
		} );
	} );
} );
