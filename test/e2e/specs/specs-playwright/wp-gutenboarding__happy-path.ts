/**
 * @group calypso-release
 */

import {
	setupHooks,
	DataHelper,
	CloseAccountFlow,
	GutenboardingFlow,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Gutenboarding: Create' ), function () {
	const siteTitle = DataHelper.getBlogName();
	const email = DataHelper.getTestEmailAddress( {
		inboxId: DataHelper.config.get( 'signupInboxId' ),
		prefix: `e2eflowtestinggutenboarding${ DataHelper.getTimestamp() }`,
	} );
	const signupPassword = DataHelper.config.get( 'passwordForNewTestSignUps' ) as string;

	let gutenboardingFlow: GutenboardingFlow;
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Signup via /new', function () {
		it( 'Navigate to /new', async function () {
			await page.goto( DataHelper.getCalypsoURL( 'new' ) );
		} );

		it( 'Enter new site name', async function () {
			gutenboardingFlow = new GutenboardingFlow( page );
			await gutenboardingFlow.enterSiteTitle( siteTitle );
			await gutenboardingFlow.clickButton( 'Continue' );
		} );

		it( 'Search for and select a WordPress.com domain name', async function () {
			await gutenboardingFlow.searchDomain( siteTitle );
			await gutenboardingFlow.selectDomain( siteTitle.concat( '.wordpress.com' ) );
			await gutenboardingFlow.clickButton( 'Continue' );
		} );

		it( 'Select Vesta as the site design', async function () {
			await gutenboardingFlow.selectDesign( 'Vesta' );
		} );

		it( 'Pick the Playfair font pairing', async function () {
			await gutenboardingFlow.selectFont( 'Playfair' );
			await gutenboardingFlow.clickButton( 'Continue' );
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
				page.waitForNavigation(),
				gutenboardingFlow.signup( email, signupPassword ),
			] );
		} );

		it( 'Land in Home dashboard', async function () {
			await page.waitForURL( '**/home/**' );
			const currentURL = page.url();
			expect( currentURL ).toContain( siteTitle );
		} );
	} );

	describe( 'Delete user account', function () {
		it( 'Close account', async function () {
			const closeAccountFlow = new CloseAccountFlow( page );
			await closeAccountFlow.closeAccount();
		} );
	} );
} );
