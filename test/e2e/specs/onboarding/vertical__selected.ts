/**
 * @group calyepso-quarantined
 */

import {
	DataHelper,
	DomainSearchComponent,
	LoginPage,
	MyHomePage,
	NewUserResponse,
	RestAPIClient,
	SignupPickPlanPage,
	StartSiteFlow,
	UserSignupPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Vertical: Selected' ), function () {
	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'free',
	} );

	let domainSearchComponent: DomainSearchComponent;
	let page: Page;
	let startSiteFlow: StartSiteFlow;
	let userCreatedFlag = false;
	let userDetails: NewUserResponse;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	describe( 'Onboarding flow', function () {
		it( 'Navigate to Signup page', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.visit();
			await loginPage.clickSignUp();
		} );

		// TODO: Investigate if using an existing user simplifies the flow
		it( 'Sign up as a new user', async function () {
			const userSignupPage = new UserSignupPage( page );
			userDetails = await userSignupPage.signup(
				testUser.email,
				testUser.username,
				testUser.password
			);

			userCreatedFlag = true;
		} );

		it( 'Select a free .wordpress.com domain', async function () {
			domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( testUser.siteName );
			await domainSearchComponent.selectDomain( '.wordpress.com' );
		} );

		it( 'Select WordPress.com Free plan', async function () {
			const signupPickPlanPage = new SignupPickPlanPage( page );
			await signupPickPlanPage.selectPlan( 'Free' );
		} );

		it( 'Skip goals step', async function () {
			startSiteFlow = new StartSiteFlow( page );

			await page.waitForLoadState( 'networkidle' );
			const currentStep = await startSiteFlow.getCurrentStep();

			if ( currentStep === 'goals' ) {
				await startSiteFlow.clickButton( 'Continue' );
			}
		} );
	} );

	describe( 'Vertical flow', function () {
		// TODO: Parameterize test with a list of common verticals
		it( 'Select a vertical based on input', async function () {
			const currentStep = await startSiteFlow.getCurrentStep();
			if ( currentStep === 'vertical' ) {
				await startSiteFlow.enterVertical( 'People & Society' );
				await startSiteFlow.selectVertical( 'People & Society' );
				await startSiteFlow.clickButton( 'Continue' );
			}
		} );

		it( 'See design picker screen for input flow', async function () {
			await startSiteFlow.validateOnDesignSetupScreen();

			// TODO: Get header validation working
			// await startSiteFlow.validateVerticalDesignHeader( 'vertical' );
		} );

		// TODO: Investigate back button bug when run on wpcalypso.wordpress.com
		it( 'Navigate back for manual flow', async function () {
			await startSiteFlow.goBackOneScreen();
		} );

		it( 'Enter a vertical manually', async function () {
			const currentStep = await startSiteFlow.getCurrentStep();
			if ( currentStep === 'vertical' ) {
				await startSiteFlow.clearVertical();
				await startSiteFlow.enterVertical( 'People & Society' );
				await startSiteFlow.toggleVerticalDropdown();
				await startSiteFlow.clickButton( 'Continue' );
			}
		} );

		// Validate that theme picker is used instead of vertical design screen
		// TODO: Investigate if manually entering an exact vertical match is a bug
		it( 'See theme picker screen for manual flow', async function () {
			await startSiteFlow.validateOnDesignPickerScreen();
		} );

		it( 'Navigate back for suggestion flow', async function () {
			await startSiteFlow.goBackOneScreen();
		} );

		it( 'Select a vertical from suggestions dropdown', async function () {
			const currentStep = await startSiteFlow.getCurrentStep();
			if ( currentStep === 'vertical' ) {
				await startSiteFlow.toggleVerticalDropdown();

				// TODO: Select random vertical from suggested list
				await startSiteFlow.selectVertical( 'Food' );
				await startSiteFlow.clickButton( 'Continue' );
			}
		} );

		it( 'See design picker screen for suggestion flow', async function () {
			await startSiteFlow.validateOnDesignSetupScreen();

			// TODO: Get header validation working
			// await startSiteFlow.validateVerticalDesignHeader( 'vertical' );
		} );

		// TODO: Find a better way to validate the selected vertical design

		it( 'Select a design', async function () {
			await startSiteFlow.clickButton( 'Continue' );
		} );

		it( 'See site on home dashboard', async function () {
			const myHomePage = new MyHomePage( page );
			await myHomePage.validateSiteTitle( 'Food' );
		} );
	} );

	afterAll( async function () {
		const restAPIClient = new RestAPIClient(
			{ username: testUser.username, password: testUser.password },
			userDetails.body.bearer_token
		);

		if ( userCreatedFlag ) {
			await apiCloseAccount( restAPIClient, {
				userID: userDetails.body.user_id,
				username: testUser.username,
				email: testUser.email,
			} );
		}
	} );
} );
