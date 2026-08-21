import { EditorPage, TestAccount, TestAccountName, envVariables } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

// We only care about simple GB edge, and we don't have this post set up for CoBlocks edge sites yet.
const isGutenbergSimpleEdgeEnvironment =
	envVariables.GUTENBERG_EDGE && ! envVariables.COBLOCKS_EDGE && ! envVariables.TEST_ON_ATOMIC;

const testAccountName: TestAccountName = 'gutenbergSimpleSiteBlockUpgradeUser';
const testPostId = 6;

test.describe(
	'Gutenberg Upgrade: Sanity-Check Most Popular Blocks on Simple edge',
	{ tag: [ tags.GUTENBERG ] },
	() => {
		test( 'As a user, I see no block warnings or errors after a Gutenberg upgrade', async ( {
			page,
		} ) => {
			test.skip(
				! isGutenbergSimpleEdgeEnvironment,
				'Only runs in Gutenberg Simple edge environment'
			);

			const testAccount = new TestAccount( testAccountName );
			await testAccount.authenticate( page );

			const postURL = `https://wordpress.com/post/${ testAccount.getSiteURL( {
				protocol: false,
			} ) }/${ testPostId }`;

			await page.goto( postURL );

			const editorPage = new EditorPage( page );
			await editorPage.waitUntilLoaded();

			// Both block invalidation and crash messages are wrapped by the same `Warning`
			// component in Gutenberg. If we find at least one warning, then we fail the test.
			expect( await editorPage.editorHasBlockWarnings() ).toBe( false );
		} );
	}
);
