import {
	DataHelper,
	MediaHelper,
	EditorPage,
	ImageBlock,
	AudioBlock,
	FileBlock,
	TestFile,
	TestAccount,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import { TEST_IMAGE_PATH, TEST_AUDIO_PATH } from '../constants';

/**
 * Tests the media-related blocks.
 *
 * Keywords: Media, Video, VideoPress, Image, Audio, File
 */
test.describe(
	'Blocks: Media (Upload)',
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

		test( 'As a user, I can publish a post with image, audio and file blocks', async ( {
			page,
		} ) => {
			// Multiple file uploads and a publish round-trip do not fit the
			// default 2-minute budget.
			test.setTimeout( 240 * 1000 );

			let testAccount: TestAccount;
			let editorPage: EditorPage;
			let testFiles: {
				image: TestFile;
				imageReservedName: TestFile;
				audio: TestFile;
			};

			await test.step( 'Authenticate and setup the test', async () => {
				testFiles = {
					image: await MediaHelper.createTestFile( TEST_IMAGE_PATH ),
					imageReservedName: await MediaHelper.createTestFile( TEST_IMAGE_PATH, {
						postfix: 'filewith#?#?reservedurlchars',
					} ),
					audio: await MediaHelper.createTestFile( TEST_AUDIO_PATH ),
				};

				testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
			} );

			await test.step( 'Start new post', async () => {
				editorPage = new EditorPage( page );

				await editorPage.visit( 'post', {
					siteSlug: testAccount.getSiteURL( { protocol: false } ),
				} );
				await editorPage.enterTitle( DataHelper.getRandomPhrase() );
			} );

			// Populate post with media blocks

			await test.step( `${ ImageBlock.blockName } block: upload image file with reserved URL characters`, async () => {
				const blockHandle = await editorPage.addBlockFromSidebar(
					ImageBlock.blockName,
					ImageBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const imageBlock = new ImageBlock( page, blockHandle );
				await imageBlock.upload( testFiles.imageReservedName.fullpath );
			} );

			await test.step( `${ ImageBlock.blockName } block: upload image file using Calypso media modal`, async () => {
				const blockHandle = await editorPage.addBlockFromSidebar(
					ImageBlock.blockName,
					ImageBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const imageBlock = new ImageBlock( page, blockHandle );
				await imageBlock.uploadThroughMediaLibrary( testFiles.image.fullpath );
			} );

			await test.step( `${ AudioBlock.blockName } block: upload audio file`, async () => {
				const blockHandle = await editorPage.addBlockFromSidebar(
					AudioBlock.blockName,
					AudioBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const audioBlock = new AudioBlock( page, blockHandle );
				await audioBlock.upload( testFiles.audio.fullpath );
			} );

			await test.step( `${ FileBlock.blockName } block: upload audio file`, async () => {
				const blockHandle = await editorPage.addBlockFromSidebar(
					FileBlock.blockName,
					FileBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const fileBlock = new FileBlock( page, blockHandle );
				await fileBlock.upload( testFiles.audio.fullpath );
			} );

			// VideoPress block: upload video file
			// If this starts failing, check whether Premium or higher plan is enabled.
			// 2024-09-16: Skipping. This has been failing all year, seems to be a problem with
			// the backend and the way the test sites get cleaned up. p1707923887553869-slack-C034JEXD1RD
			//
			// await test.step( `${ VideoPressBlock.blockName } block: upload video file`, async () => {
			// 	await editorPage.addBlockFromSidebar(
			// 		VideoPressBlock.blockName,
			// 		VideoPressBlock.blockEditorSelector,
			// 		{ noSearch: true }
			// 	);
			//
			// 	const videoPressBlock = new VideoPressBlock( page );
			// 	await videoPressBlock.upload( testFiles.video.fullpath );
			// } );

			await test.step( 'Publish and visit post', async () => {
				await editorPage.saveDraft();
				await editorPage.publish( { visit: true } );
			} );

			// Validate published post

			await test.step( 'Image with reserved characters in filename is visible', async () => {
				await Promise.any( [
					// WP < 6.6
					ImageBlock.validatePublishedContent( page, [
						testFiles.imageReservedName.filename.replace( /[^a-zA-Z ]/g, '' ),
					] ),
					// WP 6.6+, see https://github.com/WordPress/wordpress-develop/commit/2358de1767168232ff0e7c17e550b8a99f96002e
					ImageBlock.validatePublishedContent( page, [ testFiles.imageReservedName.filename ] ),
				] );
			} );

			await test.step( 'Image added via Calypso modal is visible', async () => {
				await ImageBlock.validatePublishedContent( page, [ testFiles.image.filename ] );
			} );

			await test.step( 'Audio block is visible', async () => {
				await AudioBlock.validatePublishedContent( page );
			} );

			await test.step( 'File block is visible', async () => {
				await FileBlock.validatePublishedContent( page, [ testFiles.audio.filename ] );
			} );

			// 'VideoPress block is visible' is skipped along with the upload step above.
		} );
	}
);
