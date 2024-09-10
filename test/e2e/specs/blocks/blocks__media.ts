/**
 * @group calypso-pr
 * @group gutenberg
 * @group jetpack-wpcom-integration
 */

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
import { TEST_IMAGE_PATH, TEST_AUDIO_PATH, TEST_VIDEO_PATH } from '../constants';

declare const browser: Browser;

/**
 * Tests the media-related blocks.
 *
 * Keywords: Media, Video, VideoPress, Image, Audio, File
 */
describe( DataHelper.createSuiteTitle( 'Blocks: Media (Upload)' ), function () {
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
	let testAccount: TestAccount;
	let editorPage: EditorPage;
	let testFiles: {
		image: TestFile;
		imageReservedName: TestFile;
		audio: TestFile;
		video: TestFile;
	};

	beforeAll( async () => {
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

	it( 'Start new post', async function () {
		editorPage = new EditorPage( page );

		await editorPage.visit( 'post', { siteSlug: testAccount.getSiteURL( { protocol: false } ) } );
		await editorPage.enterTitle( DataHelper.getRandomPhrase() );
	} );

	describe( 'Populate post with media blocks', function () {
		it( `${ ImageBlock.blockName } block: upload image file with reserved URL characters`, async function () {
			const blockHandle = await editorPage.addBlockFromSidebar(
				ImageBlock.blockName,
				ImageBlock.blockEditorSelector,
				{ noSearch: true }
			);
			const imageBlock = new ImageBlock( page, blockHandle );
			await imageBlock.upload( testFiles.imageReservedName.fullpath );
		} );

		it( `${ ImageBlock.blockName } block: upload image file using Calypso media modal `, async function () {
			const blockHandle = await editorPage.addBlockFromSidebar(
				ImageBlock.blockName,
				ImageBlock.blockEditorSelector,
				{ noSearch: true }
			);
			const imageBlock = new ImageBlock( page, blockHandle );
			await imageBlock.uploadThroughMediaLibrary( testFiles.image.fullpath );
		} );

		it( `${ AudioBlock.blockName } block: upload audio file`, async function () {
			const blockHandle = await editorPage.addBlockFromSidebar(
				AudioBlock.blockName,
				AudioBlock.blockEditorSelector,
				{ noSearch: true }
			);
			const audioBlock = new AudioBlock( blockHandle );
			await audioBlock.upload( testFiles.audio.fullpath );
		} );

		it( `${ FileBlock.blockName } block: upload audio file`, async function () {
			const blockHandle = await editorPage.addBlockFromSidebar(
				FileBlock.blockName,
				FileBlock.blockEditorSelector,
				{ noSearch: true }
			);
			const fileBlock = new FileBlock( page, blockHandle );
			await fileBlock.upload( testFiles.audio.fullpath );
		} );

		// If this starts failing, check whether Premium or higher plan is enabled.
		it( `${ VideoPressBlock.blockName } block: upload video file`, async function () {
			await editorPage.addBlockFromSidebar(
				VideoPressBlock.blockName,
				VideoPressBlock.blockEditorSelector,
				{ noSearch: true }
			);

			const videoPressBlock = new VideoPressBlock( page );
			await videoPressBlock.upload( testFiles.video.fullpath );
		} );

		it( 'Publish and visit post', async function () {
			await editorPage.saveDraft();
			await editorPage.publish( { visit: true } );
		} );
	} );

	describe( 'Validate published post', function () {
		it( `Image with reserved characters in filename is visible`, async function () {
			await Promise.any( [
				// WP < 6.6
				ImageBlock.validatePublishedContent( page, [
					testFiles.imageReservedName.filename.replace( /[^a-zA-Z ]/g, '' ),
				] ),
				// WP 6.6+, see https://github.com/WordPress/wordpress-develop/commit/2358de1767168232ff0e7c17e550b8a99f96002e
				ImageBlock.validatePublishedContent( page, [ testFiles.imageReservedName.filename ] ),
			] );
		} );

		it( 'Image added via Calypso modal is visible', async function () {
			await ImageBlock.validatePublishedContent( page, [ testFiles.image.filename ] );
		} );

		it( `Audio block is visible`, async function () {
			await AudioBlock.validatePublishedContent( page );
		} );

		it( `File block is visible`, async function () {
			await FileBlock.validatePublishedContent( page, [ testFiles.audio.filename ] );
		} );

		it( `VideoPress block is visible`, async function () {
			await VideoPressBlock.validatePublishedContent( page );
		} );
	} );
} );
