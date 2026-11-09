import { DataHelper } from '@automattic/calypso-e2e';
import { GLOBAL_NOTICES_CHUNK, blockChunk } from '../../lib/blocked-chunks';
import { expect, tags, test } from '../../lib/pw-base';

/**
 * A blocked non-essential chunk must not blank logged-in Calypso pages, which
 * the main Layout (client/layout/index.jsx) renders. The Reader is used as a
 * logged-in Calypso section that does not hand off to the Dashboard.
 *
 * The cookie banner is not covered here: logged-out.jsx imports it statically,
 * so in this bundle Layout's import() never requests a chunk to block.
 */
test.describe(
	DataHelper.createSuiteTitle( 'Layout: Non-essential chunks blocked by a content blocker' ),
	{ tag: [ tags.CALYPSO_PR ] },
	() => {
		test( 'As a logged-in user, I can still use Calypso when the global notices cannot load', async ( {
			accountDefaultUser,
			page,
		} ) => {
			let blocked: Awaited< ReturnType< typeof blockChunk > >;

			await test.step( 'Given I am logged in', async function () {
				await accountDefaultUser.authenticate( page );
				// Bare /home forwards to the account's landing page only after it loads.
				// Navigating while that is pending aborts the next visit, so let it land.
				await page.waitForURL( ( url ) => url.pathname !== '/home' );
			} );

			await test.step( "And the global notices' JavaScript and CSS are blocked", async function () {
				blocked = await blockChunk( page, GLOBAL_NOTICES_CHUNK.pattern );
			} );

			await test.step( 'When I visit the Reader', async function () {
				// Reader onboarding opens over the stream until the account dismisses it once.
				const dismissOnboarding = page
					.getByRole( 'dialog' )
					.getByRole( 'button', { name: 'Do it later' } );
				await page.addLocatorHandler( dismissOnboarding, () => dismissOnboarding.click() );

				await page.goto( DataHelper.getCalypsoURL( 'reader' ) );
				await page.waitForURL( /reader/ );
			} );

			await test.step( 'Then the Reader stream is shown', async function () {
				// Loading placeholders are articles too, but their titles aren't links.
				const post = page
					.getByRole( 'main' )
					.getByRole( 'article' )
					.getByRole( 'heading' )
					.getByRole( 'link' );
				await expect(
					page.getByRole( 'link', { name: 'Find sites to follow' } ).or( post ).first()
				).toBeVisible( { timeout: 30_000 } );
			} );

			await test.step( "And the global notices' chunks were requested and blocked", async function () {
				await expect.poll( () => blocked.wasJsBlocked() ).toBe( true );
			} );

			await test.step( 'And the blocked chunk raised no uncaught errors', async function () {
				expect( blocked.pageErrorMessages() ).toEqual( [] );
			} );
		} );
	}
);
