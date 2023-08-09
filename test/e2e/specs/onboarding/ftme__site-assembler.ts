/**
 * @group calypso-release
 */

import {
	DataHelper,
	StartSiteFlow,
	RestAPIClient,
	SecretsManager,
	DomainSearchComponent,
	SignupPickPlanPage,
	NewSiteResponse,
	TestAccount,
	SiteAssemblerFlow,
} from '@automattic/calypso-e2e';
import { Browser, Locator, Page } from 'playwright';
import { apiDeleteSite } from '../shared';

declare const browser: Browser;

describe( 'Site Assembler', () => {
	let newSiteDetails: NewSiteResponse;
	let page: Page;
	let selectedFreeDomain: string;

	beforeAll( async () => {
		page = await browser.newPage();

		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
	} );

	describe( 'Create site', function () {
		it( 'Navigate to /new', async function () {
			await page.goto( DataHelper.getCalypsoURL( 'start' ) );
		} );

		it( 'Select a .wordpress.com domain name', async function () {
			const domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( DataHelper.getBlogName() );
			selectedFreeDomain = await domainSearchComponent.selectDomain( '.wordpress.com' );
		} );

		it( `Select WordPress.com Free plan`, async function () {
			const signupPickPlanPage = new SignupPickPlanPage( page );
			newSiteDetails = await signupPickPlanPage.selectPlan( 'Free' );
		} );
	} );

	describe( 'Onboarding', function () {
		let startSiteFlow: StartSiteFlow;

		beforeAll( async function () {
			startSiteFlow = new StartSiteFlow( page );
		} );

		it( 'Enter Onboarding flow for the selected domain', async function () {
			await page.waitForURL(
				DataHelper.getCalypsoURL(
					`/setup/site-setup/goals?siteSlug=${ selectedFreeDomain }&siteId=${ newSiteDetails.blog_details.blogid }`
				),
				{
					timeout: 30 * 1000,
				}
			);
		} );

		it( 'Skip the Goal screen', async function () {
			await startSiteFlow.clickButton( 'Continue' );
		} );

		it( 'Select "Start designing" and land on the Site Assembler', async function () {
			await startSiteFlow.clickButton( 'Start designing' );
			await page.waitForURL(
				DataHelper.getCalypsoURL(
					`/setup/site-setup/patternAssembler?siteSlug=${ selectedFreeDomain }&siteId=${ newSiteDetails.blog_details.blogid }`
				),
				{
					timeout: 30 * 1000,
				}
			);
		} );
	} );

	describe( 'Site Assembler', function () {
		let assembledPreviewLocator: Locator;
		let startSiteFlow: SiteAssemblerFlow;

		beforeAll( async function () {
			startSiteFlow = new SiteAssemblerFlow( page );
			assembledPreviewLocator = page.locator( '.pattern-large-preview__patterns .block-renderer' );
		} );

		it( 'Select "Header"', async function () {
			await startSiteFlow.selectLayoutComponentType( 'Header' );
			await startSiteFlow.selectLayoutComponent( 1 );

			expect( await assembledPreviewLocator.count() ).toBe( 1 );

			await startSiteFlow.clickButton( 'Save' );
		} );

		it( 'Select "Footer"', async function () {
			await startSiteFlow.selectLayoutComponentType( 'Footer' );
			await startSiteFlow.selectLayoutComponent( 1 );

			expect( await assembledPreviewLocator.count() ).toBe( 2 );

			await startSiteFlow.clickButton( 'Save' );
		} );

		it( 'Click "Continue" and land on the Site Editor', async function () {
			await Promise.all( [
				page.waitForURL( /processing/ ),
				startSiteFlow.clickButton( 'Continue' ),
			] );
			await page.waitForURL( /site-editor/, {
				timeout: 30 * 1000,
			} );
		} );
	} );

	afterAll( async function () {
		if ( ! newSiteDetails ) {
			return;
		}

		const restAPIClient = new RestAPIClient( SecretsManager.secrets.testAccounts.defaultUser );

		await apiDeleteSite( restAPIClient, {
			url: newSiteDetails.blog_details.url,
			id: newSiteDetails.blog_details.blogid,
			name: newSiteDetails.blog_details.blogname,
		} );
	} );
} );
