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
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiDeleteSite } from '../shared';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'FTME: Build with "Something else" category' ), function () {
	const blogName = DataHelper.getBlogName();

	let siteCreatedFlag: boolean;
	let newSiteDetails: NewSiteResponse;
	let page: Page;

	beforeAll( async function () {
		page = await browser.newPage();

		const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
		await testAccount.authenticate( page );
	} );

	describe( 'Create site', function () {
		it( 'Navigate to /new', async function () {
			await page.goto( DataHelper.getCalypsoURL( 'start' ) );
		} );

		it( 'Select a .wordpress.com domain name', async function () {
			const domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( blogName );
			await domainSearchComponent.selectDomain( '.wordpress.com' );
		} );

		it( `Select WordPress.com Free plan`, async function () {
			const signupPickPlanPage = new SignupPickPlanPage( page );
			newSiteDetails = await signupPickPlanPage.selectPlan( 'Free' );

			siteCreatedFlag = true;
		} );
	} );

	describe( 'Onboarding', function () {
		let startSiteFlow: StartSiteFlow;

		beforeAll( async function () {
			startSiteFlow = new StartSiteFlow( page );
		} );

		it( 'Enter Onboarding flow', async function () {
			await expect( page.waitForURL( /setup\/goals\?/ ) ).resolves.not.toThrow();
		} );

		it( 'Select "Promote" goal', async function () {
			await startSiteFlow.selectGoal( 'Promote' );
			await startSiteFlow.clickButton( 'Continue' );
		} );

		it( 'Select "Something else" category', async function () {
			await startSiteFlow.enterVertical( 'Something else' );
			await startSiteFlow.clickButton( 'Continue' );
		} );
	} );

	describe( 'Build', function () {
		const themeName = 'Geologist - Cream';

		let startSiteFlow: StartSiteFlow;

		beforeAll( async function () {
			startSiteFlow = new StartSiteFlow( page );
		} );

		it( 'Select theme', async function () {
			await startSiteFlow.selectTheme( themeName );
			await startSiteFlow.clickButton( `Start with ${ themeName }` );
		} );

		it( 'Land in Home dashboard', async function () {
			await page.waitForURL(
				DataHelper.getCalypsoURL( `/home/${ newSiteDetails.blog_details.site_slug }` )
			);
		} );
	} );

	afterAll( async function () {
		if ( ! siteCreatedFlag ) {
			return;
		}

		const restAPIClient = new RestAPIClient(
			SecretsManager.secrets.testAccounts.simpleSiteFreePlanUser
		);

		await apiDeleteSite( restAPIClient, {
			url: newSiteDetails.blog_details.url,
			id: newSiteDetails.blog_details.blogid,
			name: newSiteDetails.blog_details.blogname,
		} );
	} );
} );

describe(
	DataHelper.createSuiteTitle( 'FTME: Build with "Travel Agencies & Services" category' ),
	function () {
		const blogName = DataHelper.getBlogName();

		let siteCreatedFlag: boolean;
		let newSiteDetails: NewSiteResponse;
		let page: Page;

		beforeAll( async function () {
			page = await browser.newPage();

			const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
			await testAccount.authenticate( page );
		} );

		describe( 'Create site', function () {
			it( 'Navigate to /new', async function () {
				await page.goto( DataHelper.getCalypsoURL( 'start' ) );
			} );

			it( 'Select a .wordpress.com domain name', async function () {
				const domainSearchComponent = new DomainSearchComponent( page );
				await domainSearchComponent.search( blogName );
				await domainSearchComponent.selectDomain( '.wordpress.com' );
			} );

			it( `Select WordPress.com Free plan`, async function () {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				newSiteDetails = await signupPickPlanPage.selectPlan( 'Free' );

				siteCreatedFlag = true;
			} );
		} );

		describe( 'Onboarding', function () {
			let startSiteFlow: StartSiteFlow;

			beforeAll( async function () {
				startSiteFlow = new StartSiteFlow( page );
			} );

			it( 'Enter Onboarding flow', async function () {
				await expect( page.waitForURL( /setup\/goals\?/ ) ).resolves.not.toThrow();
			} );

			it( 'Select "Promote" goal', async function () {
				await startSiteFlow.selectGoal( 'Promote' );
				await startSiteFlow.clickButton( 'Continue' );
			} );

			it( 'Select "Travel Agencies & Services" category', async function () {
				await startSiteFlow.enterVertical( 'Travel Agencies & Services' );
				await startSiteFlow.clickButton( 'Continue' );
			} );
		} );

		describe( 'Build', function () {
			const themeName = 'Geologist - Cream';

			let startSiteFlow: StartSiteFlow;

			beforeAll( async function () {
				startSiteFlow = new StartSiteFlow( page );
			} );

			it( 'Select theme', async function () {
				await startSiteFlow.selectTheme( themeName );
				await startSiteFlow.clickButton( `Start with ${ themeName }` );
			} );

			it( 'Land in Home dashboard', async function () {
				await page.waitForURL(
					DataHelper.getCalypsoURL( `/home/${ newSiteDetails.blog_details.site_slug }` )
				);
			} );
		} );

		afterAll( async function () {
			if ( ! siteCreatedFlag ) {
				return;
			}

			const restAPIClient = new RestAPIClient(
				SecretsManager.secrets.testAccounts.simpleSiteFreePlanUser
			);

			await apiDeleteSite( restAPIClient, {
				url: newSiteDetails.blog_details.url,
				id: newSiteDetails.blog_details.blogid,
				name: newSiteDetails.blog_details.blogname,
			} );
		} );
	}
);
