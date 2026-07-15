import { snoozeAccountRecoveryInterstitial } from '../../lib/dashboard-helpers';
import { getAccount } from '../../lib/get-account';
import { expect, tags, test } from '../../lib/pw-base';
import type { Page } from 'playwright';

/**
 * Registers a CDP virtual authenticator so WebAuthn prompts complete
 * automatically without a physical security key. Chromium-only.
 */
async function addVirtualAuthenticator( page: Page ): Promise< void > {
	const cdpSession = await page.context().newCDPSession( page );
	await cdpSession.send( 'WebAuthn.enable' );
	await cdpSession.send( 'WebAuthn.addVirtualAuthenticator', {
		options: {
			protocol: 'ctap2',
			transport: 'usb',
			hasResidentKey: true,
			hasUserVerification: true,
			isUserVerified: true,
			automaticPresenceSimulation: true,
		},
	} );
}

/**
 * Removes every security key on the account via the classic Calypso security
 * page. Runs as cleanup so an interrupted test never leaves a key behind,
 * which would change the account's login challenge for other specs.
 */
async function removeAllSecurityKeysViaCalypso(
	page: Page,
	calypsoBaseUrl: string
): Promise< void > {
	await page.goto( `${ calypsoBaseUrl }/me/security/two-step` );
	// The section only renders once the keys have been fetched.
	const section = page.locator( '.security-2fa-key' );
	await section.waitFor();
	const deleteButtons = section.locator( '.security-2fa-key__delete-key' );
	while ( ( await deleteButtons.count() ) > 0 ) {
		const count = await deleteButtons.count();
		await deleteButtons.first().click();
		await page.getByRole( 'button', { name: 'Remove key' } ).click();
		await expect( deleteButtons ).toHaveCount( count - 1 );
	}
}

test.describe(
	'Dashboard: Security Keys',
	{ tag: [ tags.DASHBOARD_PR, tags.CALYPSO_RELEASE ] },
	() => {
		test( 'As a WordPress.com user with two-step auth, I can register and remove a security key from the dashboard', async ( {
			browserName,
			environment,
			page,
			pageDashboard,
		} ) => {
			test.skip(
				browserName !== 'chromium',
				'CDP virtual authenticators are only available in Chromium'
			);

			const keyName = `e2e-key-${ Date.now() }`;
			let keyMayExist = false;

			try {
				await test.step( 'Given I am authenticated with two-step authentication', async function () {
					const testAccount = await getAccount( page, 'totpUser' );
					await snoozeAccountRecoveryInterstitial( testAccount.restAPI );
					await testAccount.authenticate( page, { waitUntilStable: false } );
				} );

				await test.step( 'And my browser has a security key available', async function () {
					await addVirtualAuthenticator( page );
				} );

				await test.step( 'When I visit the two-step authentication page', async function () {
					await pageDashboard.visitPath( 'me/security/two-step-auth' );
					await expect( page.getByRole( 'heading', { name: 'Security keys' } ) ).toBeVisible();
				} );

				await test.step( 'And I register a new security key', async function () {
					await page.getByRole( 'button', { name: 'Register key' } ).click();
					await page.getByLabel( 'Security key name' ).fill( keyName );
					keyMayExist = true;
					await page.getByRole( 'button', { name: 'Add key' } ).click();
				} );

				const keyItem = page.locator( '.action-item' ).filter( { hasText: keyName } );

				await test.step( 'Then the security key is registered and listed', async function () {
					await expect(
						page.getByTestId( 'snackbar' ).getByText( `Security key "${ keyName }" added.` )
					).toBeVisible();
					await expect( keyItem ).toBeVisible();
				} );

				await test.step( 'When I remove the security key', async function () {
					await keyItem.getByRole( 'button', { name: 'Remove' } ).click();
					await page.getByRole( 'button', { name: 'Remove security key' } ).click();
				} );

				await test.step( 'Then the security key is no longer listed', async function () {
					await expect(
						page.getByTestId( 'snackbar' ).getByText( 'Security key deleted.' )
					).toBeVisible();
					await expect( keyItem ).toBeHidden();
					keyMayExist = false;
				} );
			} finally {
				if ( keyMayExist ) {
					try {
						await removeAllSecurityKeysViaCalypso( page, environment.CALYPSO_BASE_URL );
					} catch ( error ) {
						// Deliberately swallowed: a cleanup failure must not mask the test result.
						console.warn( `Security key cleanup failed: ${ error }` );
					}
				}
			}
		} );
	}
);
