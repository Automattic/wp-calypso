import {
	DataHelper,
	ElementHelper,
	MediaHelper,
	StoryBlock,
	TestAccount,
	TestFile,
	envVariables,
	envToFeatureKey,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import { tags, test } from '../../lib/pw-base';
import { ALT_TEST_IMAGE_PATH, TEST_IMAGE_PATH } from '../constants';

/**
 * Isolated block test for the Story block due to accessibility issues,
 * making it unable to be run using the BlockFlow pattern.
 *
 * @see https://github.com/Automattic/jetpack/issues/32976
 *
 * Keywords: Jetpack, Media Block, Story
 */
test.describe(
	DataHelper.createSuiteTitle( 'Blocks: Jetpack Story' ),
	{ tag: [ tags.GUTENBERG, tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		const features = envToFeatureKey( envVariables );

		test( 'As a user, I can use the Story block in a post', async ( { page, pageEditor } ) => {
			const accountName = getTestAccountByFeature( features );
			const testFiles: TestFile[] = [];

			await test.step( 'Given I am authenticated', async () => {
				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );

				for ( const path of [ TEST_IMAGE_PATH, ALT_TEST_IMAGE_PATH ] ) {
					const testFile = await MediaHelper.createTestFile( path );
					testFiles.push( testFile );
				}
			} );

			await test.step( 'When I start a new post', async () => {
				const testAccount = new TestAccount( accountName );
				await pageEditor.visit( 'post', {
					siteSlug: testAccount.getSiteURL( { protocol: false } ),
				} );
				await pageEditor.enterTitle( DataHelper.getRandomPhrase() );
			} );

			await test.step( 'When I add Story block', async () => {
				await pageEditor.addBlockFromSidebar(
					StoryBlock.blockName,
					StoryBlock.blockEditorSelector,
					{ noSearch: true }
				);
			} );

			await test.step( 'When I upload images', async () => {
				const storyBlock = new StoryBlock( page );
				await storyBlock.upload( testFiles );
			} );

			await test.step( 'When I publish and visit the post', async () => {
				// Must separate out the publish and visit steps here.
				// The single call used elsewhere checks whether
				// `getByRole('main')` resolves, which will fail with the Story
				// block due to https://github.com/Automattic/jetpack/issues/32976.
				const postURL = await pageEditor.publish();
				await page.goto( postURL.href, { waitUntil: 'domcontentloaded' } );

				await ElementHelper.reloadAndRetry( page, async function ( page: Page ): Promise< void > {
					await page.locator( '.wp-story' ).waitFor();
				} );
			} );

			await test.step( 'Then the published post has the Story block', async () => {
				await StoryBlock.validatePublishedContent( page );
			} );
		} );
	}
);
