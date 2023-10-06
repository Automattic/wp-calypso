/**
 * @group calypso-release
 */

import {
	DataHelper,
	FreeSignupFlow,
	SidebarComponent,
	RestAPIClient,
	UserSignupPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';
import type { NewUserResponse } from '@automattic/calypso-e2e';

declare const browser: Browser;

describe( 'Signup: Tailored Free Flow', function () {
	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'signupfree',
	} );

	let page: Page;
	let userDetails: NewUserResponse;
	let userCreatedFlag = false;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	describe( 'Register as new user', function () {
		it( 'Navigate to the WordPress.com Free signup page', async function () {
			await page.goto( DataHelper.getCalypsoURL( 'setup/free' ) );
		} );

		it( 'Sign up as new user', async function () {
			const userSignupPage = new UserSignupPage( page );
			userDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );

			userCreatedFlag = true;
		} );
	} );

	describe( 'Onboarding', function () {
		let freeSignupFlow: FreeSignupFlow;

		beforeAll( async function () {
			freeSignupFlow = new FreeSignupFlow( page );
		} );

		it( 'Enter site name and description', async function () {
			await freeSignupFlow.enterSiteName( testUser.siteName );
			await freeSignupFlow.enterDescription( DataHelper.getRandomPhrase() );

			await Promise.all( [
				page.waitForURL( /setup\/free\/designSetup/ ),
				freeSignupFlow.clickButton( 'Continue' ),
			] );
		} );

		it( 'Pick a design', async function () {
			await freeSignupFlow.pickDesign( 'Upsidedown' );
		} );

		it( 'Land in Launchpad', async function () {
			// Processing steps often takes longer than the default timeout.
			await page.waitForURL( /launchpad/, { timeout: 30 * 1000 } );
		} );

		it( 'Launch site', async function () {
			await freeSignupFlow.clickButton( 'Launch your site' );
		} );

		it( 'Navigated to Home', async function () {
			await page.waitForURL( /home/ );

			// How we handle modals within @automattic/calypso-e2e needs a rethink.
			// Placing it as a "raw" selector for now.
			await page.getByRole( 'dialog' ).getByText( 'Congrats, your site is live!' ).waitFor();
		} );
	} );

	describe( 'Validate WordPress.com Free functionality', function () {
		let sidebarComponent: SidebarComponent;

		it( 'Site name is used for the free domain name', async function () {
			const expectedURL = `${ testUser.siteName }.wordpress.com`;
			expect( page.url() ).toMatch( expectedURL );
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
} );
