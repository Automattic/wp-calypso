import { DataHelper, RestAPIClient, UserSignupPage } from '@automattic/calypso-e2e';
import { useBlackboxTestKeyForCollect } from '../../lib/blackbox-test-key';
import { expect, tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';
import type { NewUserResponse } from '@automattic/calypso-e2e';
import type { Page, Request } from '@playwright/test';

/**
 * Blackbox verdicts on the /start/account passwordless email signup.
 *
 * Signup verification currently runs in shadow mode on the server
 * (blackbox_signup_enforcement_enabled() is off), so a block verdict is
 * recorded but must not prevent the signup. When enforcement is enabled,
 * the block test below needs to assert a rejected signup instead.
 */
test.describe( 'Signup: Blackbox /start/account', { tag: [ tags.AUTHENTICATION ] }, () => {
	const accountsToCleanup: { user: NewUserResponse[ 'body' ]; password: string; email: string }[] =
		[];

	test.afterAll( async function () {
		for ( const account of accountsToCleanup ) {
			const restAPIClient = new RestAPIClient(
				{ username: account.user.username, password: account.password },
				account.user.bearer_token
			);
			await apiCloseAccount( restAPIClient, {
				userID: account.user.user_id,
				username: account.user.username,
				email: account.email,
			} );
		}
	} );

	const waitForCollectResponse = ( page: Page ) =>
		page.waitForResponse(
			( response ) =>
				response.request().method() === 'POST' &&
				response.url().includes( 'blackbox-api.wp.com/v1/collect' ),
			{ timeout: 60 * 1000 }
		);

	const waitForUsersNewRequest = ( page: Page ): Promise< Request > =>
		page.waitForRequest(
			( request ) => request.method() === 'POST' && /\/users\/new\?/.test( request.url() ),
			{ timeout: 60 * 1000 }
		);

	test( 'As a new user, I can sign up when Blackbox returns allow', async ( {
		page,
	}, workerInfo ) => {
		test.skip(
			workerInfo.project.name !== 'authentication',
			'The authentication project is the only one that has the right browser settings for authentication tests'
		);

		const testUser = DataHelper.getNewTestUser( { usernamePrefix: 'blackbox' } );
		let newUserDetails: NewUserResponse;

		await test.step( 'Given Blackbox collect uses the public allow test key', async function () {
			await useBlackboxTestKeyForCollect( page, 'allow' );
		} );

		await test.step( 'When I visit the signup page', async function () {
			await new UserSignupPage( page ).visit( { path: 'account' } );
		} );

		await test.step( 'And I sign up with my email', async function () {
			// Blackbox is suspended until the email form becomes the active
			// surface, so the collect only fires during the signup interaction.
			const collectResponse = waitForCollectResponse( page );
			const usersNewRequest = waitForUsersNewRequest( page );

			newUserDetails = await new UserSignupPage( page ).signupSocialFirstWithEmail(
				testUser.email
			);
			// Queue teardown before asserting so a created account never leaks.
			accountsToCleanup.push( {
				user: newUserDetails.body,
				password: testUser.password,
				email: testUser.email,
			} );

			const collectBody = await ( await collectResponse ).json();
			expect( collectBody?.data?.session_id ).toBe( 'bbtest_allow__________' );

			const request = await usersNewRequest;
			expect( request.postDataJSON()?.blackbox_session_id ).toBe( 'bbtest_allow__________' );
		} );

		await test.step( 'Then the account is created', async function () {
			expect( newUserDetails.body.user_id ).toBeTruthy();
			expect( newUserDetails.body.bearer_token ).toBeTruthy();
		} );
	} );

	test( 'As a new user, I see a challenge and cannot submit while it is active', async ( {
		page,
	}, workerInfo ) => {
		test.skip(
			workerInfo.project.name !== 'authentication',
			'The authentication project is the only one that has the right browser settings for authentication tests'
		);

		await test.step( 'Given Blackbox collect uses the public challenge test key', async function () {
			await useBlackboxTestKeyForCollect( page, 'challenge' );
		} );

		const collectResponse = waitForCollectResponse( page );

		await test.step( 'When I visit the signup page and reveal the email form', async function () {
			await new UserSignupPage( page ).visit( { path: 'account' } );

			// Depending on the variant the email form is either inline or behind
			// a "Continue with email" button; Blackbox activates when it becomes
			// the active surface.
			const continueWithEmailButton = page.getByRole( 'button', {
				name: /continue with email/i,
			} );
			await Promise.race( [
				continueWithEmailButton.waitFor( { state: 'visible', timeout: 30 * 1000 } ),
				page
					.locator( 'input[name="email"]:visible' )
					.first()
					.waitFor( { state: 'visible', timeout: 30 * 1000 } ),
			] );
			if ( await continueWithEmailButton.isVisible() ) {
				await continueWithEmailButton.click();
			}

			const collectBody = await ( await collectResponse ).json();
			expect( collectBody?.data?.session_id ).toBe( 'bbtest_challenge______' );
			expect( collectBody?.data?.challenge ).toBeTruthy();
		} );

		await test.step( 'Then the challenge widget is shown and submit is blocked', async function () {
			await expect(
				page.locator( '.login__form-blackbox-challenge.has-visible-challenge' )
			).toBeVisible();
			await expect(
				page.locator( '.signup-form__passwordless-form-wrapper button[type="submit"]' )
			).toBeDisabled();
		} );
	} );

	test( 'As a new user, my signup still succeeds when Blackbox returns block (shadow mode)', async ( {
		page,
	}, workerInfo ) => {
		test.skip(
			workerInfo.project.name !== 'authentication',
			'The authentication project is the only one that has the right browser settings for authentication tests'
		);

		const testUser = DataHelper.getNewTestUser( { usernamePrefix: 'blackbox' } );
		let newUserDetails: NewUserResponse;

		await test.step( 'Given Blackbox collect uses the public block test key', async function () {
			await useBlackboxTestKeyForCollect( page, 'block' );
		} );

		await test.step( 'When I visit the signup page', async function () {
			await new UserSignupPage( page ).visit( { path: 'account' } );
		} );

		await test.step( 'And I sign up with my email', async function () {
			const collectResponse = waitForCollectResponse( page );
			const usersNewRequest = waitForUsersNewRequest( page );

			newUserDetails = await new UserSignupPage( page ).signupSocialFirstWithEmail(
				testUser.email
			);
			accountsToCleanup.push( {
				user: newUserDetails.body,
				password: testUser.password,
				email: testUser.email,
			} );

			const collectBody = await ( await collectResponse ).json();
			expect( collectBody?.data?.session_id ).toBe( 'bbtest_block__________' );

			const request = await usersNewRequest;
			expect( request.postDataJSON()?.blackbox_session_id ).toBe( 'bbtest_block__________' );
		} );

		await test.step( 'Then the account is still created (enforcement is off)', async function () {
			expect( newUserDetails.body.user_id ).toBeTruthy();
			expect( newUserDetails.body.bearer_token ).toBeTruthy();
		} );
	} );
} );
