/**
 * @group calypso-release
 */

import {
	DataHelper,
	DomainSearchComponent,
	SignupPickPlanPage,
	StartSiteFlow,
	SidebarComponent,
	RestAPIClient,
	UserSignupPage,
	LoginPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';
import type { NewUserResponse } from '@automattic/calypso-e2e';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'Plans: Create a WordPress.com Free site as a new user' ),
	function () {
		const testUser = DataHelper.getNewTestUser( {
			usernamePrefix: 'signupfree',
		} );

		let page: Page;
		let userDetails: NewUserResponse;
		let userCreatedFlag = false;
		let selectedFreeDomain: string;

		beforeAll( async () => {
			page = await browser.newPage();
		} );

		describe( 'Register as new user', function () {
			it( 'Navigate to Signup page', async function () {
				const loginPage = new LoginPage( page );
				await loginPage.visit();
				await loginPage.clickSignUp();
			} );

			it( 'Sign up as new user', async function () {
				const userSignupPage = new UserSignupPage( page );
				userDetails = await userSignupPage.signup(
					testUser.email,
					testUser.username,
					testUser.password
				);

				userCreatedFlag = true;
			} );
		} );

		describe( 'Onboarding', function () {
			it( 'Select a free .wordpress.com domain', async function () {
				const domainSearchComponent = new DomainSearchComponent( page );
				await domainSearchComponent.search( testUser.siteName );
				selectedFreeDomain = await domainSearchComponent.selectDomain( '.wordpress.com' );
			} );

			it( 'Select WordPress.com Free plan', async function () {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				await signupPickPlanPage.selectPlan( 'Free' );
			} );

			it( 'Skip to dashboard', async function () {
				const startSiteFlow = new StartSiteFlow( page );
				await Promise.all( [
					page.waitForNavigation( { url: /.*\/home\/.*/ } ),
					startSiteFlow.clickButton( 'Skip to dashboard' ),
				] );
			} );
		} );

		describe( 'Validate WordPress.com Free functionality', function () {
			let sidebarComponent: SidebarComponent;

			it( 'User has the selected free domain', async function () {
				const urlRegex = `/home/${ selectedFreeDomain }`;
				expect( page.url() ).toMatch( urlRegex );
			} );

			it( 'User is on WordPress.com Free plan', async function () {
				sidebarComponent = new SidebarComponent( page );
				const plan = await sidebarComponent.getCurrentPlanName();
				expect( plan ).toBe( 'Free' );
			} );
		} );

		afterAll( async function () {
			if ( ! userCreatedFlag ) {
				return;
			}

			const restAPIClient = new RestAPIClient(
				{ username: testUser.username, password: testUser.password },
				userDetails.body.bearer_token
			);

			await apiCloseAccount( restAPIClient, {
				userID: userDetails.body.user_id,
				username: userDetails.body.username,
				email: testUser.email,
			} );
		} );
	}
);
