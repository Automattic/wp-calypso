import {
	DataHelper,
	MediaHelper,
	EditorPage,
	ImageBlock,
	AudioBlock,
	FileBlock,
	VideoPressBlock,
	TestFile,
	TestAccount,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { test, tags } from '../../lib/pw-base';
import { TEST_IMAGE_PATH, TEST_AUDIO_PATH, TEST_VIDEO_PATH } from '../constants';

/**
 * Tests the media-related blocks.
 *
 * Keywords: Media, Video, VideoPress, Image, Audio, File
 */
test.describe(
	DataHelper.createSuiteTitle( 'Blocks: Media (Upload)' ),
	{ tag: [ tags.CALYPSO_PR, tags.GUTENBERG, tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		const features = envToFeatureKey( envVariables );

		// Default to `defaultUser` as it has WordPress.com Premium enabled, which is required
		// for VideoPress block testing.
		const accountName = getTestAccountByFeature( features, [
			{
				gutenberg: 'stable',
				siteType: 'simple',
				accountName: 'defaultUser',
			},
			{
				gutenberg: 'edge',
				siteType: 'simple',
				accountName: 'defaultUser',
			},
		] );

		let page: Page;
		let browser: Browser;
		let testAccount: TestAccount;
		let editorPage: EditorPage;
		let testFiles: {
			image: TestFile;
			imageReservedName: TestFile;
			audio: TestFile;
			video: TestFile;
		};

		test.beforeAll( async ( { browser: browserFixture } ) => {
			browser = browserFixture;
			page = await browser.newPage();

			testFiles = {
				image: await MediaHelper.createTestFile( TEST_IMAGE_PATH ),
				imageReservedName: await MediaHelper.createTestFile( TEST_IMAGE_PATH, {
					postfix: 'filewith#?#?reservedurlchars',
				} ),
				audio: await MediaHelper.createTestFile( TEST_AUDIO_PATH ),
				video: await MediaHelper.createTestFile( TEST_VIDEO_PATH ),
			};

			testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		test( 'Given user authenticated When starting new post Then editor loads with title', async () => {
			editorPage = new EditorPage( page );

			await editorPage.visit( 'post', {
				siteSlug: testAccount.getSiteURL( { protocol: false } ),
			} );
			await editorPage.enterTitle( DataHelper.getRandomPhrase() );
		} );

		test.describe( 'Populate post with media blocks', () => {
			test( `Given editor loaded When adding ${ ImageBlock.blockName } block with reserved URL characters Then image uploads successfully`, async () => {
				const blockHandle = await editorPage.addBlockFromSidebar(
					ImageBlock.blockName,
					ImageBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const imageBlock = new ImageBlock( page, blockHandle );
				await imageBlock.upload( testFiles.imageReservedName.fullpath );
			} );

			test( `Given editor loaded When adding ${ ImageBlock.blockName } block using Calypso media modal Then image uploads successfully`, async () => {
				const blockHandle = await editorPage.addBlockFromSidebar(
					ImageBlock.blockName,
					ImageBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const imageBlock = new ImageBlock( page, blockHandle );
				await imageBlock.uploadThroughMediaLibrary( testFiles.image.fullpath );
			} );

			test( `Given editor loaded When adding ${ AudioBlock.blockName } block Then audio file uploads successfully`, async () => {
				const blockHandle = await editorPage.addBlockFromSidebar(
					AudioBlock.blockName,
					AudioBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const audioBlock = new AudioBlock( page, blockHandle );
				await audioBlock.upload( testFiles.audio.fullpath );
			} );

			test( `Given editor loaded When adding ${ FileBlock.blockName } block Then audio file uploads successfully`, async () => {
				const blockHandle = await editorPage.addBlockFromSidebar(
					FileBlock.blockName,
					FileBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const fileBlock = new FileBlock( page, blockHandle );
				await fileBlock.upload( testFiles.audio.fullpath );
			} );

			// If this starts failing, check whether Premium or higher plan is enabled.
			// 2024-09-16: Skipping. This has been failing all year, seems to be a problem with the backend and the way the test sites get cleaned up. p1707923887553869-slack-C034JEXD1RD
			test.skip( `Given editor loaded When adding ${ VideoPressBlock.blockName } block Then video uploads successfully`, async () => {
				await editorPage.addBlockFromSidebar(
					VideoPressBlock.blockName,
					VideoPressBlock.blockEditorSelector,
					{ noSearch: true }
				);

				const videoPressBlock = new VideoPressBlock( page );
				await videoPressBlock.upload( testFiles.video.fullpath );
			} );

			test( 'Given post with media blocks When publishing Then post is published and visited', async () => {
				await editorPage.saveDraft();
				await editorPage.publish( { visit: true } );
			} );
		} );

		test.describe( 'Validate published post', () => {
			test( 'Given published post When viewing Then image with reserved characters in filename is visible', async () => {
				await Promise.any( [
					// WP < 6.6
					ImageBlock.validatePublishedContent( page, [
						testFiles.imageReservedName.filename.replace( /[^a-zA-Z ]/g, '' ),
					] ),
					// WP 6.6+, see https://github.com/WordPress/wordpress-develop/commit/2358de1767168232ff0e7c17e550b8a99f96002e
					ImageBlock.validatePublishedContent( page, [ testFiles.imageReservedName.filename ] ),
				] );
			} );

			test( 'Given published post When viewing Then image added via Calypso modal is visible', async () => {
				await ImageBlock.validatePublishedContent( page, [ testFiles.image.filename ] );
			} );

			test( 'Given published post When viewing Then audio block is visible', async () => {
				await AudioBlock.validatePublishedContent( page );
			} );

			test( 'Given published post When viewing Then file block is visible', async () => {
				await FileBlock.validatePublishedContent( page, [ testFiles.audio.filename ] );
			} );

			// Skipped above.
			test.skip( 'Given published post When viewing Then VideoPress block is visible', async () => {
				await VideoPressBlock.validatePublishedContent( page );
			} );
		} );
	}
);
