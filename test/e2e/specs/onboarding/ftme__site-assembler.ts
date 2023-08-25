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
import { Browser, Page } from 'playwright';
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
			await startSiteFlow.clickButton( 'Get started' );
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
		let siteAssemblerFlow: SiteAssemblerFlow;

		beforeAll( async function () {
			siteAssemblerFlow = new SiteAssemblerFlow( page );
		} );

		it( 'Select "Header"', async function () {
			// The pane is now open by default.
			// @see https://github.com/Automattic/wp-calypso/pull/80924
			await siteAssemblerFlow.selectLayoutComponent( 'Simple Header' );

			expect( await siteAssemblerFlow.getAssembledComponentsCount() ).toBe( 1 );
		} );

		it( 'Select "Sections"', async function () {
			await siteAssemblerFlow.clickLayoutComponentType( 'Sections' );
			await siteAssemblerFlow.selectLayoutComponent( 'Heading with two images and descriptions' );

			expect( await siteAssemblerFlow.getAssembledComponentsCount() ).toBe( 2 );
		} );

		it( 'Select "Footer"', async function () {
			await siteAssemblerFlow.clickLayoutComponentType( 'Footer' );
			await siteAssemblerFlow.selectLayoutComponent( 'Simple centered footer' );

			expect( await siteAssemblerFlow.getAssembledComponentsCount() ).toBe( 3 );
		} );

		it( 'Pick default style', async function () {
			// The visible button text is "Pick your style" but the accessible name is
			// as below. Introduced in https://github.com/Automattic/wp-calypso/pull/80924.
			await siteAssemblerFlow.clickButton( 'Add your first pattern to get started.' );
			await siteAssemblerFlow.pickStyle( 'Color: Free style' );
		} );

		it( 'Click "Save and continue" and land on the Site Editor', async function () {
			await Promise.all( [
				page.waitForURL( /processing/ ),
				siteAssemblerFlow.clickButton( 'Save and continue' ),
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
