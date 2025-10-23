/**
 * @group calypso-release
 */

import {
	DataHelper,
	DomainSearchComponent,
	SignupPickPlanPage,
	CartCheckoutPage,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { getAccount } from '../../lib/get-account';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Launch site flow: Purchase domain and plan' ), function () {
	const planName = 'Personal';
	let page: Page;
	let siteUrl: string;
	let testAccount: TestAccount;
	let selectedDomain: string;

	beforeAll( async () => {
		page = await browser.newPage();
		testAccount = await getAccount( page, 'simpleSiteFreePlanUser' );
		await testAccount.authenticate( page );
		siteUrl = testAccount.getSiteURL( { protocol: false } );
	} );

	it( 'Enter the flow', async function () {
		const flowUrl = DataHelper.getCalypsoURL( `/start/launch-site?siteSlug=${ siteUrl }` );
		await page.goto( flowUrl );
	} );

	it( 'Search for a domain', async function () {
		const domainSearchComponent = new DomainSearchComponent( page );
		await domainSearchComponent.search( DataHelper.getBlogName() );
	} );

	it( 'Add the first suggestion to the cart', async function () {
		const domainSearchComponent = new DomainSearchComponent( page );
		selectedDomain = await domainSearchComponent.selectFirstSuggestion( false );
	} );

	it( `Select ${ planName } plan`, async function () {
		const signupPickPlanPage = new SignupPickPlanPage( page );
		await signupPickPlanPage.selectPlanWithoutSiteCreation( planName );
	} );

	it( 'See plan and domain at checkout', async function () {
		const cartCheckoutPage = new CartCheckoutPage( page );
		await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
		await cartCheckoutPage.validateCartItem( selectedDomain );
	} );
} );
