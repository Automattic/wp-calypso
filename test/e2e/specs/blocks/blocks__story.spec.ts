import {
	MediaHelper,
	EditorPage,
	TestAccount,
	StoryBlock,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
	TestFile,
} from '@automattic/calypso-e2e';
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
	'Blocks: Jetpack Story',
	{ tag: [ tags.GUTENBERG, tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		test( 'As a user, I can add and configure a Story block', async ( { page, helperData } ) => {
			const features = envToFeatureKey( envVariables );
			const accountName = getTestAccountByFeature( features );
			const testFiles: TestFile[] = [];

			let testAccount: TestAccount;
			let editorPage: EditorPage;

			await test.step( 'Given I have test image files', async function () {
				for ( const path of [ TEST_IMAGE_PATH, ALT_TEST_IMAGE_PATH ] ) {
					const testFile = await MediaHelper.createTestFile( path );
					testFiles.push( testFile );
				}
			} );

			await test.step( `And I am authenticated as '${ accountName }'`, async function () {
				testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
			} );

			await test.step( 'When I start a new post', async function () {
				editorPage = new EditorPage( page );
				await editorPage.visit( 'post', {
					siteSlug: testAccount.getSiteURL( { protocol: false } ),
				} );
				await editorPage.enterTitle( helperData.getRandomPhrase() );
			} );

			await test.step( 'And I add a Story block', async function () {
				await editorPage.addBlockFromSidebar(
					StoryBlock.blockName,
					StoryBlock.blockEditorSelector,
					{
						noSearch: true,
					}
				);
			} );

			await test.step( 'And I upload images', async function () {
				const storyBlock = new StoryBlock( page );
				await storyBlock.upload( testFiles );
			} );

			await test.step( 'And I publish and visit the post', async function () {
				// Must separate out the publish and visit steps here.
				// The single call used elsewhere checks whether
				// `getByRole('main')` resolves, which will fail with the Story
				// block due to https://github.com/Automattic/jetpack/issues/32976.
				const postURL = await editorPage.publish();
				await page.goto( postURL.href );
			} );

			await test.step( 'Then the Story block is visible in the published post', async function () {
				await StoryBlock.validatePublishedContent( page );
			} );
		} );
	}
);
