/**
 * This spec is meant to be a lightweight test of popular/relevant blocks across
 * Gutenberg versions. This will run in a site stickered with `gutenberg-edge` and
 * will load a specific post with pre-configured blocks in it. It will then verify
 * that none of these blocks are error'ing or invalidating in the editor.
 *
 * This spec is not meant to replace specific block specs. First of all, specific
 * block specs should ideally be added upstream, and not here in Calypso, unless
 * the block is developed as part of the Calypso monorepo. This test is also not
 * meant to test specific block behavior, but instead to verify if they continue
 * working across GB versions, during the GB upgrade process in WPCOM.
 *
 * To avoid any confusion, the tests here will only run if the GUTENBERG_EDGE env
 * var is set.
 */
import { EditorPage, TestAccount, TestAccountName } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	'Gutenberg Upgrade: Sanity-Check Most Popular Blocks on Simple edge',
	{ tag: [ tags.GUTENBERG ] },
	() => {
		test( 'As a user, I can verify that blocks work after Gutenberg upgrade', async ( {
			page,
			environment,
		} ) => {
			// We only care about simple GB edge, and we don't have this post set up for CoBlocks edge sites yet.
			const isGutenbergSimpleEdgeEnvironment =
				environment.GUTENBERG_EDGE && ! environment.COBLOCKS_EDGE && ! environment.TEST_ON_ATOMIC;

			test.skip(
				! isGutenbergSimpleEdgeEnvironment,
				'Test only runs on Gutenberg Simple Edge environment'
			);

			const testAccountName: TestAccountName = 'gutenbergSimpleSiteBlockUpgradeUser';
			const testPostId = 6;

			let editorPage: EditorPage;

			await test.step( 'Given I am authenticated and viewing the test post', async function () {
				const testAccount = new TestAccount( testAccountName );
				await testAccount.authenticate( page );

				const postURL = `https://wordpress.com/post/${ testAccount.getSiteURL( {
					protocol: false,
				} ) }/${ testPostId }`;

				await page.goto( postURL );
			} );

			await test.step( 'Then there are no block warnings after upgrade', async function () {
				editorPage = new EditorPage( page );
				await editorPage.waitUntilLoaded();

				// Both block invalidation and crash messages are wrapped by the same `Warning`
				// component in Gutenberg. If we find at least one warning, then we fail the test.
				expect( await editorPage.editorHasBlockWarnings() ).toBe( false );
			} );
		} );
	}
);
