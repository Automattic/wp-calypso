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

describe( DataHelper.createSuiteTitle( 'Vertical: None, Something Else, or Skip' ), function () {
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
		it( 'Skip vertical selection', async function () {
			const currentStep = await startSiteFlow.getCurrentStep();
			if ( currentStep === 'vertical' ) {
				await startSiteFlow.clickButton( 'Continue' );
			}
		} );

		// Validate that theme picker is used instead of vertical design screen
		it( 'See theme picker screen for no vertical', async function () {
			await startSiteFlow.validateOnDesignPickerScreen();
		} );

		it( 'Navigate back for Something else flow', async function () {
			await startSiteFlow.goBackOneScreen();
		} );

		it( 'Select Something else', async function () {
			const currentStep = await startSiteFlow.getCurrentStep();
			if ( currentStep === 'vertical' ) {
				await startSiteFlow.enterVertical( 'People & Society' );
				await startSiteFlow.selectVertical( 'Something else' );
				await startSiteFlow.clickButton( 'Continue' );
			}
		} );

		// Validate that theme picker is used instead of vertical design screen
		it( 'See theme picker screen for Something else vertical', async function () {
			await startSiteFlow.validateOnDesignPickerScreen();
		} );

		it( 'Navigate back for skip to dashboard flow', async function () {
			await startSiteFlow.goBackOneScreen();
		} );

		// TODO: Go through theme selection flow
		it( 'Skip to dashboard', async function () {
			await startSiteFlow.clickButton( 'Skip to dashboard' );
		} );

		// TODO: Investigate bug where last selected vertical is used even when
		// vertical is eventually skipped
		it( 'See site on home dashboard', async function () {
			const myHomePage = new MyHomePage( page );
			await myHomePage.validateSiteTitle( 'Something else' );
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
