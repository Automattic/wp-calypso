import {
	DataHelper,
	EmailClient,
	RestAPIClient,
	SecretsManager,
	UserSignupPage,
} from '@automattic/calypso-e2e';
import { useBlackboxTestKeyForCollect, waitForCollectData } from '../../lib/blackbox-test-key';
import { expect, skipIfMailosaurLimitReached, tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';
import type { NewTestUserDetails, NewUserResponse } from '@automattic/calypso-e2e';
import type { Page, Request } from '@playwright/test';

/**
 * Blackbox verdicts on the logged-out invite-accept signup form.
 *
 * Invites are created via the REST API, but the accept-invite URL must be
 * taken from the invite email (Mailosaur): a valid accept URL requires the
 * invite secret, which is only ever embedded in the emailed link — the REST
 * API exposes just the bare invite slug, which the server rejects.
 *
 * Signup verification enforces its verdicts on the closed test loop, which
 * these signups are on and their gmail-aliased siblings are not: the loop wants
 * a username in the `e2eflowtesting` namespace, and the passwordless form sends
 * none, so the server derives one from the email local part. A Mailosaur
 * address gives it `e2eflowtestingblackbox...`; a gmail alias gives it the base
 * address first. Production stays in shadow mode either way.
 */
test.describe( 'Signup: Blackbox invite accept', { tag: [ tags.AUTHENTICATION ] }, () => {
	skipIfMailosaurLimitReached();
	const credentials = SecretsManager.secrets.testAccounts.defaultUser;
	const siteID = credentials.testSites?.primary?.id as number;

	const accountsToCleanup: { user: NewUserResponse[ 'body' ]; password: string; email: string }[] =
		[];
	// Emails this suite has invited; only their pending invites are deleted in
	// teardown so concurrent runs' invites are never touched.
	const createdInviteEmails: string[] = [];

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

		if ( ! createdInviteEmails.length ) {
			return;
		}
		// Best-effort cleanup: a failure here must not fail an otherwise-passing
		// run, so swallow errors and log them instead.
		try {
			const restAPIClient = new RestAPIClient( credentials );
			const staleKeys = ( await restAPIClient.getInvites( siteID, 100 ) )
				.filter(
					( invite ) => invite.is_pending && createdInviteEmails.includes( invite.user.email )
				)
				.map( ( invite ) => invite.invite_key );
			if ( staleKeys.length ) {
				await restAPIClient.deleteInvites( siteID, staleKeys );
			}
		} catch ( error ) {
			process.stderr.write( `[blackbox-signup-invite] invite teardown failed: ${ error }\n` );
		}
	} );

	/**
	 * Creates an invite for the test user via the REST API and returns the
	 * accept-invite URL from the invite email, rehosted onto the Calypso
	 * environment under test (the emailed link always points at wordpress.com).
	 */
	const createAcceptInviteURL = async (
		clientEmail: EmailClient,
		testUser: NewTestUserDetails
	): Promise< string > => {
		const restAPIClient = new RestAPIClient( credentials );

		// Track before the call: createInvite can create the invite server-side
		// and still throw, so the email must be queued for teardown regardless.
		createdInviteEmails.push( testUser.email );
		await restAPIClient.createInvite( siteID, { email: [ testUser.email ], role: 'Editor' } );

		const message = await clientEmail.getLastMatchingMessage( {
			inboxId: testUser.inboxId,
			sentTo: testUser.email,
		} );
		const links = await clientEmail.getLinksFromMessage( message );
		const acceptInviteLink = links.find( ( link ) => link.includes( 'accept-invite' ) );
		expect( acceptInviteLink ).toBeDefined();

		// The emailed link is a click-tracking redirect; the real accept URL
		// (with the invite key and email_verification_secret) is in redirect_to.
		const trackingURL = new URL( acceptInviteLink as string );
		const acceptInviteURL = new URL(
			trackingURL.searchParams.get( 'redirect_to' ) ?? ( acceptInviteLink as string )
		);
		// Fail loudly if the email's tracking-link format changes: rehosting a
		// non-accept path would otherwise surface as an opaque collect timeout.
		expect( acceptInviteURL.pathname ).toContain( '/accept-invite/' );

		return DataHelper.getCalypsoURL( acceptInviteURL.pathname + acceptInviteURL.search );
	};

	const waitForUsersNewRequest = ( page: Page ): Promise< Request > =>
		page.waitForRequest(
			( request ) => request.method() === 'POST' && /\/users\/new\?/.test( request.url() ),
			{ timeout: 60 * 1000 }
		);

	test( 'As an invited new user, I can sign up when Blackbox returns allow', async ( {
		page,
		clientEmail,
	}, workerInfo ) => {
		test.skip(
			workerInfo.project.name !== 'authentication',
			'The authentication project is the only one that has the right browser settings for authentication tests'
		);

		const testUser = DataHelper.getNewTestUser( {
			useMailosaur: true,
			usernamePrefix: 'blackbox',
		} );
		let acceptInviteURL: string;
		let newUserDetails: NewUserResponse;

		await test.step( 'Given an invite exists for my email', async function () {
			acceptInviteURL = await createAcceptInviteURL( clientEmail, testUser );
		} );

		await test.step( 'And Blackbox collect uses the public allow test key', async function () {
			await useBlackboxTestKeyForCollect( page, 'allow' );
		} );

		const collectData = waitForCollectData( page );

		await test.step( 'When I visit the accept-invite page', async function () {
			await page.goto( acceptInviteURL );

			const collectBody = await collectData;
			expect( collectBody?.data?.session_id ).toBe( 'bbtest_allow__________' );
		} );

		await test.step( 'And I sign up with my email', async function () {
			const usersNewRequest = waitForUsersNewRequest( page );

			newUserDetails = await new UserSignupPage( page ).signupThroughInvite( testUser.email );
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

	test( 'As an invited new user, I see a challenge and cannot submit while it is active', async ( {
		page,
		clientEmail,
	}, workerInfo ) => {
		test.skip(
			workerInfo.project.name !== 'authentication',
			'The authentication project is the only one that has the right browser settings for authentication tests'
		);

		const testUser = DataHelper.getNewTestUser( {
			useMailosaur: true,
			usernamePrefix: 'blackbox',
		} );
		let acceptInviteURL: string;

		await test.step( 'Given an invite exists for my email', async function () {
			acceptInviteURL = await createAcceptInviteURL( clientEmail, testUser );
		} );

		await test.step( 'And Blackbox collect uses the public challenge test key', async function () {
			await useBlackboxTestKeyForCollect( page, 'challenge' );
		} );

		const collectData = waitForCollectData( page );

		await test.step( 'When I visit the accept-invite page', async function () {
			await page.goto( acceptInviteURL );

			const collectBody = await collectData;
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

	test( 'As an invited new user, my signup is refused when Blackbox returns block', async ( {
		page,
		clientEmail,
	}, workerInfo ) => {
		test.skip(
			workerInfo.project.name !== 'authentication',
			'The authentication project is the only one that has the right browser settings for authentication tests'
		);

		const testUser = DataHelper.getNewTestUser( {
			useMailosaur: true,
			usernamePrefix: 'blackbox',
		} );
		let acceptInviteURL: string;
		let newUserDetails: NewUserResponse;

		await test.step( 'Given an invite exists for my email', async function () {
			acceptInviteURL = await createAcceptInviteURL( clientEmail, testUser );
		} );

		await test.step( 'And Blackbox collect uses the public block test key', async function () {
			await useBlackboxTestKeyForCollect( page, 'block' );
		} );

		const collectData = waitForCollectData( page );

		await test.step( 'When I visit the accept-invite page', async function () {
			await page.goto( acceptInviteURL );

			const collectBody = await collectData;
			expect( collectBody?.data?.session_id ).toBe( 'bbtest_block__________' );
		} );

		await test.step( 'And I sign up with my email', async function () {
			const usersNewRequest = waitForUsersNewRequest( page );

			newUserDetails = await new UserSignupPage( page ).signupThroughInvite( testUser.email );
			// A refused signup leaves nothing to close. Queue teardown only for an
			// account created anyway — off the test loop the verdict is not enforced
			// — so it never leaks and an empty identity is never reported as a leak.
			if ( newUserDetails.body.user_id ) {
				accountsToCleanup.push( {
					user: newUserDetails.body,
					password: testUser.password,
					email: testUser.email,
				} );
			}

			const request = await usersNewRequest;
			expect( request.postDataJSON()?.blackbox_session_id ).toBe( 'bbtest_block__________' );
		} );

		await test.step( 'Then the signup is refused and no account is created', async function () {
			// The refusal is dressed as the signup throttle: same `throttled` slug,
			// no ban behind it. See blackbox_verify_signup().
			expect( newUserDetails.code ).toBe( 403 );
			expect( newUserDetails.body.error ).toBe( 'throttled' );
			expect( newUserDetails.body.user_id ).toBeUndefined();
		} );

		await test.step( 'And the page tells me why', async function () {
			// The notice carries the server's own message, so read it back from the
			// response rather than pinning the copy here.
			expect( newUserDetails.body.message ).toBeTruthy();
			await expect( page.locator( '.calypso-notice.is-error .calypso-notice__text' ) ).toHaveText(
				newUserDetails.body.message as string
			);
		} );
	} );
} );
