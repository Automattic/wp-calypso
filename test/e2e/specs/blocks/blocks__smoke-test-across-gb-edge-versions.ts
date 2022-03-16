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
import { EditorPage, TestAccount, envVariables, skipItIf } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe.each`
	siteType      | accountName                        | testPostId
	${ 'Simple' } | ${ 'gutenbergUpgradeEdgeUser' }    | ${ 42805 }
	${ 'Atomic' } | ${ 'gutenbergAtomicSiteEdgeUser' } | ${ 32 }
`(
	'Gutenberg Upgrade: Sanity-Check Most Popular Blocks on ($siteType) edge',
	function ( { siteType, accountName, testPostId } ) {
		let page: Page;
		let editorPage: EditorPage;

		beforeAll( async () => {
			page = await browser.newPage();

			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );

			const postURL = `https://wordpress.com/post/${ testAccount.getSiteURL( {
				protocol: false,
			} ) }/${ testPostId }`;

			await page.goto( postURL );

			editorPage = new EditorPage( page );
		} );

		// Both block invalidation and crash messages are wrapped by the same `Warning`
		// component in Gutenberg. If we find at least one warning, then we fail the test.
		skipItIf( ! envVariables.GUTENBERG_EDGE )(
			`Block warnings are not obeserved for ${ siteType }`,
			async () => {
				await editorPage.waitUntilLoaded();

				expect( await editorPage.editorHasBlockWarnings() ).toBe( false );
			}
		);
	}
);
