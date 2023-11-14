/**
 * @group gutenberg
 * @group jetpack-wpcom-integration
 */

import {
	DataHelper,
	MediaHelper,
	EditorPage,
	TestAccount,
	StoryBlock,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
	TestFile,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { ALT_TEST_IMAGE_PATH, TEST_IMAGE_PATH } from '../constants';

declare const browser: Browser;

/**
 * Isolated block test for the Story block due to accessiblity issues,
 * making it unable to be run using the BlockFlow pattern.
 *
 * @see https://github.com/Automattic/jetpack/issues/32976
 *
 * Keywords: Jetpack, Media Block, Story
 */
describe( DataHelper.createSuiteTitle( 'Blocks: Jetpack Story' ), function () {
	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( features );
	const testFiles: TestFile[] = [];

	let page: Page;
	let testAccount: TestAccount;
	let editorPage: EditorPage;

	beforeAll( async () => {
		page = await browser.newPage();

		testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
		await testAccount.authenticateWpAdmin( page );

		for ( const path of [ TEST_IMAGE_PATH, ALT_TEST_IMAGE_PATH ] ) {
			const testFile = await MediaHelper.createTestFile( path );
			testFiles.push( testFile );
		}
	} );

	it( 'Start new post', async function () {
		editorPage = new EditorPage( page );

		await editorPage.visit( 'post', { siteSlug: testAccount.getSiteURL( { protocol: false } ) } );
		await editorPage.enterTitle( DataHelper.getRandomPhrase() );
	} );

	it( 'Add Story block', async function () {
		await editorPage.addBlockFromSidebar( StoryBlock.blockName, StoryBlock.blockEditorSelector, {
			noSearch: true,
		} );
	} );

	it( 'Upload images', async function () {
		const storyBlock = new StoryBlock( page );
		await storyBlock.upload( testFiles );
	} );

	it( 'Publish and visit post', async function () {
		// Must separate out the publish and visit steps here.
		// The single call used elsewhere checks whether
		// `getByRole('main')` resolves, which will fail with the Story
		// block due to https://github.com/Automattic/jetpack/issues/32976.
		const postURL = await editorPage.publish();
		await page.goto( postURL.href );
	} );

	it( 'Validate the published post', async function () {
		await StoryBlock.validatePublishedContent( page );
	} );
} );
