import { DataHelper, TestAccount } from '@automattic/calypso-e2e';
import { snoozeAccountRecoveryInterstitial } from '../../lib/dashboard-helpers';
import { getAccount } from '../../lib/get-account';
import { expect, tags, test } from '../../lib/pw-base';

const CANONICAL_RP_ID = 'wordpress.com';
const REGISTRATION_CHALLENGE_PATH = '/me/two-step/security-key/registration_challenge';

/**
 * Regression test for a WebAuthn passkey break caused by a Multi-site
 * Dashboard (MSD) rollout change.
 *
 * Background: a passkey registered on the new hosting dashboard
 * (my.wordpress.com) is bound to WebAuthn `rp.id = my.wordpress.com` at
 * creation. The WordPress.com login security-key step always requests a
 * challenge scoped to `rp id = wordpress.com` -- `postLoginRequest` in
 * client/state/login/utils.jsx posts unconditionally to
 * https://wordpress.com/wp-login.php, regardless of where the user is
 * logging in from. A passkey only works at the rp id it was created for, so
 * a key minted on the dashboard host became invisible at login: the browser
 * offered no matching credential and the user silently couldn't sign in
 * with it.
 *
 * The break shipped in a Multi-site Dashboard change and was mitigated by
 * disabling the MSD rollout (revert PR #112593). The root cause is still
 * live in the registration challenge, which derives rp id from a hostname
 * param instead of a fixed canonical value -- see
 * fetchTwoStepAuthSecurityKeyRegistrationChallenge in
 * packages/api-core/src/me-two-step/fetchers.ts and the `hostname` param
 * built in packages/api-queries/src/me-two-step.ts. That check only omits
 * the hostname override when `config( 'env_id' ) === 'production'`, but the
 * dashboard runs under `env_id: 'dashboard-production'`, not the literal
 * `'production'` value the check compares against. So the registration
 * challenge already requests a non-canonical rp id on the dashboard host
 * today, and this assertion fails against production until that check is
 * fixed.
 *
 * This test does not run a full WebAuthn ceremony -- CI has no authenticator
 * attached to answer navigator.credentials.create(). Instead it drives the
 * registration challenge from the dashboard host and inspects the network
 * response directly: the bug reproduces as soon as `rp.id` stops being the
 * canonical wordpress.com host.
 *
 * Gap / follow-up: no test account in this harness has a pre-registered
 * WebAuthn security key, and the login page only offers the security-key
 * 2FA option to accounts that already have one (see
 * getTwoFactorSupportedAuthTypes in client/state/login/selectors.js). That
 * makes the login-side webauthn-challenge-endpoint response unreachable
 * through the UI today, so this spec asserts the registration rp id against
 * the canonical host directly (the value the login step is hardcoded to
 * use) rather than comparing two live responses. A dedicated passkey-capable
 * test account, plus optionally a CDP virtual-authenticator harness, would
 * let a future version complete the full round trip. Tracked as a follow-up
 * in TESTOPS-227.
 */

test.describe(
	'Authentication: Passkey (security key) rp id consistency',
	{ tag: [ tags.AUTHENTICATION ] },
	() => {
		test.skip(
			DataHelper.isCalypsoProduction() === false,
			'Skipping unless running on WordPress.com'
		);

		test( 'As a user with 2FA already enabled, registering a security key from the hosting dashboard requests a challenge scoped to the canonical wordpress.com rp id', async ( {
			page,
			pageDashboard,
		}, workerInfo ) => {
			test.skip(
				workerInfo.project.name !== 'authentication',
				'The authentication project is the only one with the browser settings (disabled site isolation) needed to reliably observe the proxied API request'
			);

			await test.step( 'Given I log in as a user with 2FA already enabled', async function () {
				// Reuses cached auth cookies when fresh instead of always submitting a
				// live TOTP code, to avoid an OTP-reuse collision with the TOTP
				// account also used by authentication__totp.spec.ts.
				const testAccount: TestAccount = await getAccount( page, 'totpUser' );
				await snoozeAccountRecoveryInterstitial( testAccount.restAPI );
				// Skip waiting for Calypso sidebar — we navigate to the dashboard immediately after.
				await testAccount.authenticate( page, { waitUntilStable: false } );
			} );

			await test.step( 'When I open two-step authentication settings on the hosting dashboard', async function () {
				await pageDashboard.visit();
				await pageDashboard.visitPath( '/me/security/two-step-auth' );
				await page.getByRole( 'button', { name: 'Register key' } ).waitFor( { state: 'visible' } );
			} );

			let registrationRpId: string | undefined;

			await test.step( 'And I start registering a security key', async function () {
				await page.getByRole( 'button', { name: 'Register key' } ).click();
				await page.getByLabel( 'Security key name' ).fill( 'e2e-rp-id-check' );

				const [ challengeResponse ] = await Promise.all( [
					page.waitForResponse( ( response ) =>
						response.url().includes( REGISTRATION_CHALLENGE_PATH )
					),
					page.getByRole( 'button', { name: 'Add key' } ).click(),
				] );

				const body = await challengeResponse.json();
				registrationRpId = body?.rp?.id;

				// The ceremony itself never completes -- there is no authenticator in
				// CI to answer navigator.credentials.create(), and completing it would
				// persist a security key on a shared test account. Only the challenge
				// request/response is needed for this assertion, so abandon the
				// ceremony here rather than let it hang.
				await page.goto( 'about:blank' );
			} );

			await test.step( 'Then the registration challenge is scoped to the canonical wordpress.com rp id, not the dashboard host', async function () {
				expect( registrationRpId ).toBe( CANONICAL_RP_ID );
			} );
		} );
	}
);
