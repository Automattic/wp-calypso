/**
 *
 */

import {
	DataHelper,
	CloseAccountFlow,
	GutenboardingFlow,
	FullSiteEditorPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Gutenboarding: Create' ), function () {
	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'gutenboarding',
	} );

	const themeName = 'Twenty Twenty-Two Red';

	let gutenboardingFlow: GutenboardingFlow;
	let page: Page;

	beforeAll( async function () {
		page = await browser.newPage();
	} );

	describe( 'Signup via /new', function () {
		it( 'Navigate to /new', async function () {
			await page.goto( DataHelper.getCalypsoURL( 'new' ) );
		} );

		it( 'Enter new site name', async function () {
			gutenboardingFlow = new GutenboardingFlow( page );
			await gutenboardingFlow.enterSiteTitle( testUser.siteName );
			await gutenboardingFlow.clickButton( 'Continue' );
		} );

		it( 'Search for and select a WordPress.com domain name', async function () {
			await gutenboardingFlow.searchDomain( testUser.siteName );
			await gutenboardingFlow.selectDomain( testUser.siteName.concat( '.wordpress.com' ) );
			await gutenboardingFlow.clickButton( 'Continue' );
		} );

		it( `Select ${ themeName } as the site design`, async function () {
			await gutenboardingFlow.selectDesign( themeName );
		} );

		it( 'Select to add the Plugin feature', async function () {
			await gutenboardingFlow.selectFeatures( [ 'Plugins' ] );
			await gutenboardingFlow.clickButton( 'Continue' );
		} );

		it( 'WordPress.com Business plan is recommended', async function () {
			await gutenboardingFlow.validateRecommendedPlan( 'Business' );
		} );

		it( 'Select free plan', async function () {
			await gutenboardingFlow.selectPlan( 'Free' );
		} );

		it( 'Create account', async function () {
			await Promise.all( [
				page.waitForNavigation( { waitUntil: 'networkidle' } ),
				gutenboardingFlow.signup( testUser.email, testUser.password ),
			] );
		} );

		it( 'Navigated to Site Editor', async function () {
			await page.waitForURL( /.*\/site-editor\/.*/, { waitUntil: 'networkidle' } );

			// {@TODO} This is temporary while the FSE spec is awaiting migration to Playwright.
			const fullSiteEditorPage = new FullSiteEditorPage( page, { target: 'simple' } );
			await fullSiteEditorPage.waitUntilLoaded();
		} );
	} );

	describe( 'Delete user account', function () {
		it( 'Navigate to Home dashboard', async function () {
			// When you go to the home dashboard, there is a delayed redirect to '**/home/<sitename>'.
			// That delayed redirect can disrupt following actions in a race condition, so we must wait for that redirect to finish!
			await Promise.all( [
				page.waitForNavigation( { url: '**/home/**' } ),
				page.goto( DataHelper.getCalypsoURL( 'home' ) ),
			] );
		} );

		it( 'Close account', async function () {
			const closeAccountFlow = new CloseAccountFlow( page );
			await closeAccountFlow.closeAccount();
		} );
	} );
} );
