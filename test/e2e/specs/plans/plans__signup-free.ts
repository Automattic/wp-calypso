/**
 * @group calypso-release
 */

import {
	DataHelper,
	DomainSearchComponent,
	SignupPickPlanPage,
	StartSiteFlow,
	SidebarComponent,
	SecretsManager,
	PlansPage,
	RestAPIClient,
	UserSignupPage,
	LoginPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'Plans: Create a WordPress.com Free site as new user' ),
	function () {
		const username = `e2eflowtestingfree${ DataHelper.getTimestamp() }`;
		const password = SecretsManager.secrets.passwordForNewTestSignUps;
		const email = DataHelper.getTestEmailAddress( {
			inboxId: SecretsManager.secrets.mailosaur.inviteInboxId,
			prefix: username,
		} );
		const blogName = DataHelper.getBlogName();

		let page: Page;
		let userID: number;
		let bearerToken: string;
		let userCreatedFlag = false;

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
				const details = await userSignupPage.signup( email, username, password );
				userID = details.ID;
				bearerToken = details.bearer_token;

				userCreatedFlag = true;
			} );
		} );

		describe( 'Onboarding', function () {
			it( 'Select a free .wordpress.com domain', async function () {
				const domainSearchComponent = new DomainSearchComponent( page );
				await domainSearchComponent.search( blogName );
				await domainSearchComponent.selectDomain( '.wordpress.com' );
			} );

			it( 'Select WordPress.com Free plan', async function () {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				await signupPickPlanPage.selectPlan( 'Start with Free' );
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

			it( 'User is on WordPress.com Free plan', async function () {
				sidebarComponent = new SidebarComponent( page );
				const plan = await sidebarComponent.getCurrentPlanName();
				expect( plan ).toBe( 'Free' );
			} );

			it( 'Navigate to Upgrades > Plans', async function () {
				sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.navigate( 'Upgrade', 'Plans' );
			} );

			it( 'View plan comparison', async function () {
				const plansPage = new PlansPage( page, 'current' );
				await plansPage.showPlanComparison();
			} );
		} );

		afterAll( async function () {
			if ( ! userCreatedFlag ) {
				return;
			}

			const restAPIClient = new RestAPIClient(
				{ username: username, password: password },
				bearerToken
			);

			const response = await restAPIClient.closeUserAccount( userID, username, email );

			if ( response.success !== true ) {
				console.log( `Failed to delete user ID ${ userID }` );
			} else {
				console.log( `Successfully deleted user ID ${ userID }` );
			}
			return response;
		} );
	}
);
