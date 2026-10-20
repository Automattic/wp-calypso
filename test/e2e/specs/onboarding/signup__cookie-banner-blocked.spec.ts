import { DataHelper } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

/**
 * Content blockers ("EasyList - Cookie Notices" and similar) can block the
 * cookie banner's chunk. Its `AsyncLoad` must then render nothing instead of
 * rejecting up the tree and blanking the logged-out signup page.
 */
const COOKIE_BANNER_CHUNK = /\/async-load-calypso-blocks-privacy-prefs\.[^/]*\.(js|css)(\?|$)/;

test.describe(
	DataHelper.createSuiteTitle( 'Signup: Cookie banner blocked by a content blocker' ),
	{ tag: [ tags.CALYPSO_PR ] },
	() => {
		test( 'As a logged-out user, I can still use the signup step when the cookie banner cannot load', async ( {
			page,
			viewportName,
		} ) => {
			const blockedChunks: string[] = [];
			const pageErrors: Error[] = [];

			await test.step( "Given the cookie banner's JavaScript and CSS are blocked", async function () {
				await page.route( COOKIE_BANNER_CHUNK, ( route ) => {
					blockedChunks.push( route.request().url() );
					return route.abort( 'blockedbyclient' );
				} );
				page.on( 'pageerror', ( error ) => pageErrors.push( error ) );
			} );

			await test.step( 'When I visit the onboarding user step', async function () {
				// The flag is off on stage and locally; it is on in production.
				await page.goto(
					DataHelper.getCalypsoURL( '/setup/onboarding/user', { flags: 'cookie-banner' } ),
					{ waitUntil: 'domcontentloaded' }
				);
			} );

			const emailInput = page.locator( 'input[name="email"]' );
			// Desktop hides the email field behind "Continue with email"; mobile shows it inline.
			const signupEntryPoint =
				viewportName === 'mobile'
					? emailInput
					: page.getByRole( 'button', { name: 'Continue with email' } );

			await test.step( 'Then the signup options are shown', async function () {
				await expect( signupEntryPoint ).toBeVisible();
			} );

			await test.step( "And the cookie banner's chunks were requested and blocked", async function () {
				await expect
					.poll( () => blockedChunks.some( ( url ) => /\.js(\?|$)/.test( url ) ) )
					.toBe( true );
			} );

			await test.step( 'And I can enter my email address', async function () {
				await signupEntryPoint.click();
				await emailInput.fill( 'cookie-banner-blocked@example.com' );
				await expect( emailInput ).toHaveValue( 'cookie-banner-blocked@example.com' );
			} );

			await test.step( 'And the blocked chunk raised no uncaught errors', async function () {
				expect( pageErrors.map( ( error ) => error.message ) ).toEqual( [] );
			} );
		} );
	}
);
