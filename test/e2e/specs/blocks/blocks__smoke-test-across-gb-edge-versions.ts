/**
 * @group gutenberg
 *
 * This spec is meant to be a lightweight test of popular/relevant blocks across
 * Gutenberg versions. This will run in a site stickered with `gutenberg-edge` and
 * will load a specific post with pre-configured blocks in it. It will then verify
 * that none of these blocks are error'ing or invalidating in the editor.
 *
 * This spec is not meant to replace specific block sepcs. First of all, specific
 * block specs should ideally be added upstream, and not here in Calypso, unless
 * the block is developed as part of the Calypso monorepo. This test is also not
 * meant to test specific block behavior, but instead to verify if they continue
 * working across GB versions, during the GB upgrade process in WPCOM.
 *
 * To avoid any confusion, the tests here will only run if the GUTENBERG_EDGE env
 * var is set.
 */
import { envVariables, skipItIf, testAcrossSimpleAndAtomic } from '@automattic/calypso-e2e';

type AdditionalRecord = { testPostId: number };

testAcrossSimpleAndAtomic< AdditionalRecord >( [ { testPostId: 2 }, { testPostId: 3 } ] )(
	'Gutenberg Upgrade: Sanity-Check Most Popular Blocks on ($siteType) edge',
	( v, t ) => {
		beforeAll( async () => {
			const postURL = `https://wordpress.com/post/${ v.testAccount.getSiteURL( {
				protocol: false,
			} ) }/${ t.testPostId }`;

			await v.page.goto( postURL );
		} );
		// Both block invalidation and crash messages are wrapped by the same `Warning`
		// component in Gutenberg. If we find at least one warning, then we fail the test.
		skipItIf( ! envVariables.GUTENBERG_EDGE )( 'will not have any block warnings', async () => {
			await v.gutenbergEditorPage.waitUntilLoaded();
			expect( await v.gutenbergEditorPage.editorHasBlockWarnings() ).toBe( false );
		} );
	}
);
