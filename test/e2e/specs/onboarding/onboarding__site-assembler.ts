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
		it( 'Navigate to /start', async function () {
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
			// There's some flakiness (race condition?) where the test occasionally passes the goals page.
			if ( ! page.url().includes( 'designSetup' ) ) {
				await page.waitForURL( /setup\/site-setup\/goals/, {
					waitUntil: 'domcontentloaded',
					timeout: 20 * 1000,
				} );
			} else {
				console.warn( '"Enter Onboarding flow for the selected domain" is flaky.' );
			}

			expect( page.url() ).toContain( 'siteSlug' );
			expect( page.url() ).toContain( 'siteId' );
		} );

		it( 'Skip the Goal screen', async function () {
			// Check to see if we're still on the goals page before clicking continue.
			if ( page.url().includes( 'goals' ) ) {
				try {
					await startSiteFlow.clickButton( 'Continue' );
				} catch ( error ) {
					// clickButton might timeout if the test passed the goals page. Log the error and try to proceed.
					console.warn( '"Skipping the goal screen" is flaky.' );
				}
			}
		} );

		it( 'Select "Choose a theme" and land on the Design Picker', async function () {
			await startSiteFlow.clickButton( 'Choose a theme' );
			await page.waitForURL( /setup\/site-setup\/designSetup/ );
		} );

		it( 'Select "Start designing" and land on the Site Assembler', async function () {
			await startSiteFlow.clickButton( 'Design your own' );
			await page.waitForURL( /setup\/site-setup\/pattern-assembler/, {
				timeout: 30 * 1000,
			} );
		} );
	} );

	describe( 'Site Assembler', function () {
		let siteAssemblerFlow: SiteAssemblerFlow;

		beforeAll( async function () {
			siteAssemblerFlow = new SiteAssemblerFlow( page );
		} );

		it( 'Select a pattern in the default category', async function () {
			await siteAssemblerFlow.selectLayoutComponent( { index: 0 } );

			expect( await siteAssemblerFlow.getAssembledComponentsCount() ).toBe( 3 );
		} );

		it( 'Select a Testimonials pattern', async function () {
			await siteAssemblerFlow.clickLayoutComponentType( 'Testimonials' );
			await siteAssemblerFlow.selectLayoutComponent( { index: 0 } );

			expect( await siteAssemblerFlow.getAssembledComponentsCount() ).toBe( 4 );
		} );

		it( 'Select another Header pattern', async function () {
			await siteAssemblerFlow.clickLayoutComponentType( 'Header' );
			await siteAssemblerFlow.selectLayoutComponent( { index: 0 } );

			expect( await siteAssemblerFlow.getAssembledComponentsCount() ).toBe( 4 );
		} );

		it( 'Select another Footer pattern', async function () {
			await siteAssemblerFlow.clickLayoutComponentType( 'Footer' );
			await siteAssemblerFlow.selectLayoutComponent( { index: 1 } );

			expect( await siteAssemblerFlow.getAssembledComponentsCount() ).toBe( 4 );
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
