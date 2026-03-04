import {
	ImageBlock,
	AudioBlock,
	FileBlock,
	VideoPressBlock,
	TestFile,
} from '@automattic/calypso-e2e';
import { test, tags } from '../../lib/pw-base';
import { TEST_IMAGE_PATH, TEST_AUDIO_PATH, TEST_VIDEO_PATH } from '../constants';

/**
 * Tests the media-related blocks.
 *
 * Keywords: Media, Video, VideoPress, Image, Audio, File
 */
test.describe(
	'Blocks: Media (Upload)',
	{ tag: [ tags.CALYPSO_PR, tags.GUTENBERG, tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		test.skip( ( { viewportName } ) => viewportName === 'mobile', 'Skipped on mobile viewports' );

		test( 'As a WordPress.com user, I can upload media files using various blocks and see them on the published post', async ( {
			accountDefaultUser,
			helperMedia,
			helperData,
			page,
			pageEditor,
		} ) => {
			let testFiles: {
				image: TestFile;
				imageReservedName: TestFile;
				audio: TestFile;
				video: TestFile;
			};

			await test.step( 'Given I have test media files prepared', async function () {
				testFiles = {
					image: await helperMedia.createTestFile( TEST_IMAGE_PATH ),
					imageReservedName: await helperMedia.createTestFile( TEST_IMAGE_PATH, {
						postfix: 'filewith#?#?reservedurlchars',
					} ),
					audio: await helperMedia.createTestFile( TEST_AUDIO_PATH ),
					video: await helperMedia.createTestFile( TEST_VIDEO_PATH ),
				};
			} );

			await test.step( 'And I am authenticated as a user with a Premium plan', async function () {
				await accountDefaultUser.authenticate( page );
			} );

			await test.step( 'And I have a new post open in the editor', async function () {
				await pageEditor.visit( 'post', {
					siteSlug: accountDefaultUser.getSiteURL( { protocol: false } ),
				} );
				await pageEditor.enterTitle( helperData.getRandomPhrase() );
			} );

			await test.step( 'When I add an Image block and upload an image with reserved URL characters', async function () {
				const blockHandle = await pageEditor.addBlockFromSidebar(
					ImageBlock.blockName,
					ImageBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const imageBlock = new ImageBlock( page, blockHandle );
				await imageBlock.upload( testFiles.imageReservedName.fullpath );
			} );

			await test.step( 'And I add an Image block and upload an image via the Calypso media library', async function () {
				const blockHandle = await pageEditor.addBlockFromSidebar(
					ImageBlock.blockName,
					ImageBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const imageBlock = new ImageBlock( page, blockHandle );
				await imageBlock.uploadThroughMediaLibrary( testFiles.image.fullpath );
			} );

			await test.step( 'And I add an Audio block and upload an audio file', async function () {
				const blockHandle = await pageEditor.addBlockFromSidebar(
					AudioBlock.blockName,
					AudioBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const audioBlock = new AudioBlock( page, blockHandle );
				await audioBlock.upload( testFiles.audio.fullpath );
			} );

			await test.step( 'And I add a File block and upload an audio file', async function () {
				const blockHandle = await pageEditor.addBlockFromSidebar(
					FileBlock.blockName,
					FileBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const fileBlock = new FileBlock( page, blockHandle );
				await fileBlock.upload( testFiles.audio.fullpath );
			} );

			await test.step( 'When I save as draft and publish the post', async function () {
				await pageEditor.saveDraft();
				await pageEditor.publish( { visit: true } );
			} );

			await test.step( 'Then the image with reserved URL characters in the filename is visible', async function () {
				await Promise.any( [
					// WP < 6.6
					ImageBlock.validatePublishedContent( page, [
						testFiles.imageReservedName.filename.replace( /[^a-zA-Z ]/g, '' ),
					] ),
					// WP 6.6+, see https://github.com/WordPress/wordpress-develop/commit/2358de1767168232ff0e7c17e550b8a99f96002e
					ImageBlock.validatePublishedContent( page, [ testFiles.imageReservedName.filename ] ),
				] );
			} );

			await test.step( 'And the image uploaded via the Calypso media library is visible', async function () {
				await ImageBlock.validatePublishedContent( page, [ testFiles.image.filename ] );
			} );

			await test.step( 'And the Audio block is visible', async function () {
				await AudioBlock.validatePublishedContent( page );
			} );

			await test.step( 'And the File block is visible', async function () {
				await FileBlock.validatePublishedContent( page, [ testFiles.audio.filename ] );
			} );
		} );

		// If this starts failing, check whether Premium or higher plan is enabled.
		// 2024-09-16: Skipping. This has been failing all year, seems to be a problem with the backend
		// and the way the test sites get cleaned up. p1707923887553869-slack-C034JEXD1RD
		test( 'As a WordPress.com user with a Premium plan, I can upload a VideoPress video via the VideoPress block', async ( {
			accountDefaultUser,
			helperMedia,
			helperData,
			page,
			pageEditor,
		} ) => {
			test.skip( true, 'Skipping: persistent backend issue with VideoPress uploads on test sites' );

			const videoFile = await helperMedia.createTestFile( TEST_VIDEO_PATH );

			await accountDefaultUser.authenticate( page );

			await pageEditor.visit( 'post', {
				siteSlug: accountDefaultUser.getSiteURL( { protocol: false } ),
			} );
			await pageEditor.enterTitle( helperData.getRandomPhrase() );

			await pageEditor.addBlockFromSidebar(
				VideoPressBlock.blockName,
				VideoPressBlock.blockEditorSelector,
				{ noSearch: true }
			);

			const videoPressBlock = new VideoPressBlock( page );
			await videoPressBlock.upload( videoFile.fullpath );

			await pageEditor.publish( { visit: true } );
			await VideoPressBlock.validatePublishedContent( page );
		} );
	}
);
