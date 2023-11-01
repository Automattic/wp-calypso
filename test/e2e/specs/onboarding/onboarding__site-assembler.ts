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

describe( 'Onboarding: Site Assembler', () => {
	let newSiteDetails: NewSiteResponse;
	let page: Page;

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
			await domainSearchComponent.selectDomain( '.wordpress.com' );
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
			await page.waitForURL( /setup\/site-setup\/goals/, {
				timeout: 20 * 1000,
			} );
			expect( page.url() ).toContain( 'siteSlug' );
			expect( page.url() ).toContain( 'siteId' );
		} );

		it( 'Skip the Goal screen', async function () {
			await startSiteFlow.clickButton( 'Continue' );
		} );

		it( 'Select "Start designing" and land on the Site Assembler', async function () {
			await startSiteFlow.clickButton( 'Design your own' );
			await page.waitForURL( /setup\/site-setup\/patternAssembler/, {
				timeout: 30 * 1000,
			} );
		} );
	} );

	describe( 'Site Assembler', function () {
		let siteAssemblerFlow: SiteAssemblerFlow;

		beforeAll( async function () {
			siteAssemblerFlow = new SiteAssemblerFlow( page );
		} );

		it( 'Select a Header pattern', async function () {
			// The pane is now open by default.
			// @see https://github.com/Automattic/wp-calypso/pull/80924
			await siteAssemblerFlow.selectLayoutComponent( { index: 0 } );

			expect( await siteAssemblerFlow.getAssembledComponentsCount() ).toBe( 1 );
		} );

		it( 'Select a Quote pattern', async function () {
			await siteAssemblerFlow.clickLayoutComponentType( 'Quotes' );
			await siteAssemblerFlow.selectLayoutComponent( { index: 0 } );

			expect( await siteAssemblerFlow.getAssembledComponentsCount() ).toBe( 2 );
		} );

		it( 'Select a Footer pattern', async function () {
			await siteAssemblerFlow.clickLayoutComponentType( 'Footer' );
			await siteAssemblerFlow.selectLayoutComponent( { index: 0 } );

			expect( await siteAssemblerFlow.getAssembledComponentsCount() ).toBe( 3 );
		} );

		it( 'Pick default style', async function () {
			await siteAssemblerFlow.clickButton( 'Select styles' );
			await siteAssemblerFlow.pickStyle( 'Color: Free style' );
			await siteAssemblerFlow.clickButton( 'Select pages' );
		} );

		it( 'Click "Save and continue" in the Pages screen', async function () {
			await siteAssemblerFlow.clickButton( 'Save and continue' );
		} );

		it( 'Click "Save and continue" and land on the Site Editor', async function () {
			const urlPromise = page.waitForURL( /processing/ );
			await siteAssemblerFlow.clickButton( 'Start adding content' );
			await urlPromise;

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
