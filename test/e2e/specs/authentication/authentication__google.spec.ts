import fs from 'node:fs';
import path from 'node:path';
import {
	DataHelper,
	GoogleLoginPage,
	GoogleSessionError,
	GoogleSessionRenewalError,
} from '@automattic/calypso-e2e';
import { expect, tags, test as base } from '../../lib/pw-base';
import type { BrowserContext, Cookie } from 'playwright';

const test = base.extend< { _googlePrivacy: void } >( {
	_googlePrivacy: [
		async ( {}, use ) => {
			const previous = process.env.PLAYWRIGHT_NO_COPY_PROMPT;
			// Playwright's failure DOM snapshots are independent of trace and screenshot settings.
			process.env.PLAYWRIGHT_NO_COPY_PROMPT = '1';
			try {
				await use();
			} finally {
				if ( previous === undefined ) {
					delete process.env.PLAYWRIGHT_NO_COPY_PROMPT;
				} else {
					process.env.PLAYWRIGHT_NO_COPY_PROMPT = previous;
				}
			}
		},
		{ auto: true },
	],
} );

test.use( {
	trace: 'off',
	video: 'off',
	screenshot: 'off',
	storageState: { cookies: [], origins: [] },
	// `env: {}` keeps E2E_SECRETS_KEY and other CI secrets out of the browser process.
	launchOptions: { args: [], channel: 'chromium', slowMo: 0, env: {} },
} );

const googleDomains = new Set( [
	'google.com',
	'accounts.google.com',
	'myaccount.google.com',
	'www.google.com',
] );

const Stage = {
	Preparation: 'Google session preparation',
	LoginPage: 'WordPress.com login page',
	GoogleConsent: 'Google account selection or consent',
	ProductionLogin: 'production login',
} as const;
type Stage = ( typeof Stage )[ keyof typeof Stage ];

// Errors in these stages may carry Google page content or cookie data.
const privateStages = new Set< Stage >( [ Stage.Preparation, Stage.GoogleConsent ] );

function requireGoogleSession( cookies: Cookie[] | undefined ): Cookie[] {
	if ( ! cookies?.length ) {
		throw new GoogleSessionRenewalError(
			'Google session is missing; renew googleLoginUser.googleSessionCookies.'
		);
	}
	if (
		! cookies.every( ( cookie ) => googleDomains.has( cookie.domain.replace( /^\./, '' ) ) ) ||
		! cookies.some( ( cookie ) => cookie.name === 'SID' && cookie.value.length > 0 ) ||
		! cookies.some(
			( cookie ) => /^__Secure-[13]PSID$/.test( cookie.name ) && cookie.value.length > 0
		)
	) {
		throw new GoogleSessionRenewalError(
			'Google session is invalid; renew googleLoginUser.googleSessionCookies.'
		);
	}
	return cookies;
}

/**
 * Keeps renewal guidance and WordPress.com assertion details, suppresses anything
 * that may echo Google page content or cookies.
 * E.g. a missing My Home heading reports the locator; a Google popup timeout does not.
 */
function failureReason( error: unknown, stage: Stage ): string {
	if ( error instanceof GoogleSessionRenewalError ) {
		return `${ error.message } See test/e2e/docs/google_authentication.md for session renewal.`;
	}
	if ( error instanceof GoogleSessionError ) {
		return error.message;
	}
	if ( privateStages.has( stage ) || ! ( error instanceof Error ) ) {
		return 'Private details suppressed.';
	}
	return error.message;
}

function observeLogin( context: BrowserContext, email: string, clientID: string ) {
	const evidence = { exchange: false, identity: false, login: false };
	const pending: Promise< boolean >[] = [];
	context.on( 'response', ( response ) => {
		const url = new URL( response.url() );
		const action = url.searchParams.get( 'action' );
		if (
			url.hostname !== 'wordpress.com' ||
			! [ 'exchange-social-auth-code', 'social-login-endpoint' ].includes( action || '' )
		) {
			return;
		}
		pending.push(
			( async () => {
				try {
					const body = await response.json();
					if ( response.status() !== 200 || body.success !== true ) {
						return false;
					}
					if ( action === 'exchange-social-auth-code' ) {
						const claims = JSON.parse(
							Buffer.from( body.data.id_token.split( '.' )[ 1 ], 'base64url' ).toString()
						);
						evidence.exchange = true;
						evidence.identity =
							claims.email.toLowerCase() === email.toLowerCase() &&
							claims.aud === clientID &&
							[ 'accounts.google.com', 'https://accounts.google.com' ].includes( claims.iss ) &&
							claims.exp > Date.now() / 1000;
						return evidence.identity;
					}
					evidence.login = true;

					return true;
				} catch {
					return false;
				}
			} )()
		);
	} );
	return { evidence, pending };
}

test.describe( 'Authentication: Google', { tag: [ tags.AUTHENTICATION ] }, () => {
	test.skip(
		DataHelper.isCalypsoProduction() === false,
		'Skipping unless running on WordPress.com as Google authentication requires prod callbacks'
	);

	test( 'As a WordPress.com user, I can use my Google account to authenticate ', async ( {
		page,
		pageLogin,
		secrets,
	}, workerInfo ) => {
		test.skip(
			workerInfo.project.name !== 'authentication',
			'Only the authentication project is configured for authentication tests; this file sets its own launch options'
		);
		let stage: Stage = Stage.Preparation;
		let failed = false;
		try {
			expect( ! process.env.DEBUG && ! process.env.PWDEBUG ).toBe( true );
			const account = secrets.testAccounts.googleLoginUser;
			const cookies = requireGoogleSession( account.googleSessionCookies );
			const context = page.context();
			expect(
				( await context.cookies() ).every( ( cookie ) => cookie.name === 'sensitive_pixel_options' )
			).toBe( true );
			await context.addCookies( cookies );
			const clientID = JSON.parse(
				fs.readFileSync( path.resolve( __dirname, '../../../../config/_shared.json' ), 'utf8' )
			).google_oauth_client_id;
			const observed = observeLogin( context, account.username, clientID );

			stage = Stage.LoginPage;
			await pageLogin.visit();
			expect( /^https:\/\/wordpress\.com\/log-in(?:[?#]|$)/.test( page.url() ) ).toBe( true );
			await expect( page.getByRole( 'button', { name: 'Continue with Google' } ) ).toBeVisible();

			stage = Stage.GoogleConsent;
			const popup = await pageLogin.clickLoginWithGoogle();
			await expect
				.poll( () => popup.isClosed() || /^https:\/\/accounts\.google\.com\//.test( popup.url() ), {
					timeout: 15000,
					message: 'Google popup did not load.',
				} )
				.toBe( true );
			const googleLoginPage = new GoogleLoginPage( popup );
			await expect
				.poll(
					async () => {
						if ( ! popup.isClosed() ) {
							await googleLoginPage.continueWithSession( account.username );
						}
						return popup.isClosed();
					},
					{
						timeout: 60000,
						intervals: [ 500 ],
						message: 'Google account selection or consent did not complete.',
					}
				)
				.toBe( true );

			stage = Stage.ProductionLogin;
			await expect
				.poll( () => /^https:\/\/wordpress\.com\/home\//.test( page.url() ), {
					timeout: 10000,
					message: 'WordPress.com My Home did not load.',
				} )
				.toBe( true );
			await expect( page.getByRole( 'heading', { name: 'My Home' } ) ).toBeVisible();
			expect( ( await Promise.all( observed.pending ) ).every( Boolean ) ).toBe( true );
			expect( observed.evidence ).toEqual( { exchange: true, identity: true, login: true } );
		} catch ( error ) {
			failed = true;
			throw new Error(
				`Google authentication failed at ${ stage }. ${ failureReason( error, stage ) }`
			);
		} finally {
			// A cleanup failure must not replace the test failure that is already in flight.
			await page
				.context()
				.close()
				.catch( () => {
					if ( ! failed ) {
						throw new Error(
							'Google authentication context cleanup failed; private details suppressed.'
						);
					}
				} );
		}
	} );
} );
