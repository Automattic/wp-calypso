import { DataHelper } from '@automattic/calypso-e2e';
import { GLOBAL_NOTICES_CHUNK, blockChunk } from '../../lib/blocked-chunks';
import { expect, tags, test } from '../../lib/pw-base';

/**
 * A blocked non-essential chunk must not blank logged-out Calypso pages, which
 * the logged-out Layout (client/layout/logged-out.jsx) renders. The theme
 * showcase is used as a public, logged-out Calypso section.
 *
 * The cookie banner is not covered here: logged-out.jsx imports it statically,
 * so there is no chunk to block.
 */
test.describe(
	DataHelper.createSuiteTitle(
		'Logged-out Layout: Non-essential chunks blocked by a content blocker'
	),
	{ tag: [ tags.CALYPSO_PR ] },
	() => {
		test( 'As a logged-out user, I can still browse themes when the global notices cannot load', async ( {
			page,
		} ) => {
			let blocked: Awaited< ReturnType< typeof blockChunk > >;

			await test.step( "Given the global notices' JavaScript and CSS are blocked", async function () {
				blocked = await blockChunk( page, GLOBAL_NOTICES_CHUNK.pattern );
			} );

			await test.step( 'When I visit the theme showcase', async function () {
				await page.goto( DataHelper.getCalypsoURL( 'themes' ), { waitUntil: 'domcontentloaded' } );
			} );

			const searchInput = page.getByRole( 'searchbox', { name: 'Search', exact: true } );

			await test.step( 'Then the theme search is shown', async function () {
				await expect( searchInput ).toBeVisible( { timeout: 30_000 } );
			} );

			await test.step( "And the global notices' chunks were requested and blocked", async function () {
				await expect.poll( () => blocked.wasJsBlocked() ).toBe( true );
			} );

			await test.step( 'And I can search for a theme', async function () {
				// The showcase is server-rendered, so the search box shows before the client
				// app runs. Results only appear if the app is still mounted afterwards.
				await searchInput.fill( 'blog' );
				await searchInput.press( 'Enter' );
				await expect( page.getByRole( 'heading', { name: 'Results for "blog"' } ) ).toBeVisible( {
					timeout: 30_000,
				} );
			} );

			await test.step( 'And the blocked chunk raised no uncaught errors', async function () {
				expect( blocked.pageErrorMessages() ).toEqual( [] );
			} );
		} );
	}
);
