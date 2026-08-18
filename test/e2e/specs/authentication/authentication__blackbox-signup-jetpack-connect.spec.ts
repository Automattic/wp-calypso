import { DataHelper, RestAPIClient, UserSignupPage } from '@automattic/calypso-e2e';
import { useBlackboxTestKeyForCollect } from '../../lib/blackbox-test-key';
import { expect, tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';
import type { NewUserResponse } from '@automattic/calypso-e2e';
import type { Page, Request } from '@playwright/test';

/**
 * Blackbox verdicts on the Jetpack Connect signup (logged-out
 * /jetpack/connect/authorize).
 *
 * The authorize query is only schema-validated client-side, so placeholder
 * values render the real signup form and the /users/new account creation
 * succeeds; only the Jetpack site authorization after signup would fail,
 * which these tests never reach.
 *
 * Signup verification currently runs in shadow mode on the server
 * (blackbox_signup_enforcement_enabled() is off), so a block verdict is
 * recorded but must not prevent the signup. When enforcement is enabled,
 * the block test below needs to assert a rejected signup instead.
 */
test.describe( 'Signup: Blackbox Jetpack Connect', { tag: [ tags.AUTHENTICATION ] }, () => {
	const jetpackAuthorizeURL = DataHelper.getCalypsoURL( 'jetpack/connect/authorize', {
		_wp_nonce: 'e2enonce',
		blogname: 'Blackbox E2E',
		client_id: '12345',
		home_url: 'https://example.com',
		redirect_uri: 'https://example.com/wp-admin/admin.php?page=jetpack',
		scope: 'administrator:e2ehash',
		secret: 'e2esecret',
		site: 'https://example.com',
		site_url: 'https://example.com',
		state: '1',
	} );

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

	test( 'As a new user, I can sign up through Jetpack Connect when Blackbox returns allow', async ( {
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

		const collectResponse = waitForCollectResponse( page );

		await test.step( 'When I visit the Jetpack Connect authorize page', async function () {
			await page.goto( jetpackAuthorizeURL );

			const collectBody = await ( await collectResponse ).json();
			expect( collectBody?.data?.session_id ).toBe( 'bbtest_allow__________' );
		} );

		await test.step( 'And I sign up with my email', async function () {
			const usersNewRequest = waitForUsersNewRequest( page );

			newUserDetails = await new UserSignupPage( page ).signupWithEmail( testUser.email );
			// Queue teardown before asserting so a created account never leaks.
			accountsToCleanup.push( {
				user: newUserDetails.body,
				password: testUser.password,
				email: testUser.email,
			} );

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

		await test.step( 'When I visit the Jetpack Connect authorize page', async function () {
			await page.goto( jetpackAuthorizeURL );

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

		const collectResponse = waitForCollectResponse( page );

		await test.step( 'When I visit the Jetpack Connect authorize page', async function () {
			await page.goto( jetpackAuthorizeURL );

			const collectBody = await ( await collectResponse ).json();
			expect( collectBody?.data?.session_id ).toBe( 'bbtest_block__________' );
		} );

		await test.step( 'And I sign up with my email', async function () {
			const usersNewRequest = waitForUsersNewRequest( page );

			newUserDetails = await new UserSignupPage( page ).signupWithEmail( testUser.email );
			accountsToCleanup.push( {
				user: newUserDetails.body,
				password: testUser.password,
				email: testUser.email,
			} );

			const request = await usersNewRequest;
			expect( request.postDataJSON()?.blackbox_session_id ).toBe( 'bbtest_block__________' );
		} );

		await test.step( 'Then the account is still created (enforcement is off)', async function () {
			expect( newUserDetails.body.user_id ).toBeTruthy();
			expect( newUserDetails.body.bearer_token ).toBeTruthy();
		} );
	} );
} );
