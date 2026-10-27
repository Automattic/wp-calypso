import { DataHelper } from '@automattic/calypso-e2e';
import { COOKIE_BANNER_CHUNK, GLOBAL_NOTICES_CHUNK, blockChunk } from '../../lib/blocked-chunks';
import { expect, tags, test } from '../../lib/pw-base';

/**
 * A blocked non-essential chunk must not blank the logged-out signup page,
 * which Stepper renders.
 */
test.describe(
	DataHelper.createSuiteTitle( 'Signup: Non-essential chunks blocked by a content blocker' ),
	{ tag: [ tags.CALYPSO_PR ] },
	() => {
		for ( const chunk of [ COOKIE_BANNER_CHUNK, GLOBAL_NOTICES_CHUNK ] ) {
			test( `As a logged-out user, I can still use the signup step when the ${ chunk.name } cannot load`, async ( {
				page,
				viewportName,
			} ) => {
				let blocked: Awaited< ReturnType< typeof blockChunk > >;

				await test.step( `Given the ${ chunk.name }'s JavaScript and CSS are blocked`, async function () {
					blocked = await blockChunk( page, chunk.pattern );
				} );

				await test.step( 'When I visit the onboarding user step', async function () {
					// The cookie banner flag is off on stage and locally; it is on in production.
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
					// Same budget UserSignupPage gives the signup form to hydrate.
					await expect( signupEntryPoint ).toBeVisible( { timeout: 30_000 } );
				} );

				await test.step( `And the ${ chunk.name }'s chunks were requested and blocked`, async function () {
					await expect.poll( () => blocked.wasJsBlocked() ).toBe( true );
				} );

				await test.step( 'And I can enter my email address', async function () {
					await signupEntryPoint.click();
					await emailInput.fill( 'blocked-chunk@example.com' );
					await expect( emailInput ).toHaveValue( 'blocked-chunk@example.com' );
				} );

				await test.step( 'And the blocked chunk raised no uncaught errors', async function () {
					expect( blocked.pageErrorMessages() ).toEqual( [] );
				} );
			} );
		}
	}
);
