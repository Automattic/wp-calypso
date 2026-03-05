import {
	AudioBlock,
	DataHelper,
	FileBlock,
	ImageBlock,
	MediaHelper,
	TestAccount,
	TestFile,
	VideoPressBlock,
	envVariables,
	envToFeatureKey,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import { TEST_AUDIO_PATH, TEST_IMAGE_PATH, TEST_VIDEO_PATH } from '../constants';

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

		test( 'As a user, I can upload media blocks in a post', async ( { page, pageEditor } ) => {
			let testFiles: {
				image: TestFile;
				imageReservedName: TestFile;
				audio: TestFile;
				video: TestFile;
			};

			await test.step( 'Given I am authenticated', async () => {
				const testAccount = new TestAccount( accountName );
				testFiles = {
					image: await MediaHelper.createTestFile( TEST_IMAGE_PATH ),
					imageReservedName: await MediaHelper.createTestFile( TEST_IMAGE_PATH, {
						postfix: 'filewith#?#?reservedurlchars',
					} ),
					audio: await MediaHelper.createTestFile( TEST_AUDIO_PATH ),
					video: await MediaHelper.createTestFile( TEST_VIDEO_PATH ),
				};
				await testAccount.authenticate( page );
			} );

			await test.step( 'When I start a new post', async () => {
				await pageEditor.visit( 'post', {
					siteSlug: new TestAccount( accountName ).getSiteURL( { protocol: false } ),
				} );
				await pageEditor.enterTitle( DataHelper.getRandomPhrase() );
			} );

			await test.step( `${ ImageBlock.blockName } block: upload image file with reserved URL characters`, async () => {
				const blockHandle = await pageEditor.addBlockFromSidebar(
					ImageBlock.blockName,
					ImageBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const imageBlock = new ImageBlock( page, blockHandle );
				await imageBlock.upload( testFiles!.imageReservedName.fullpath );
			} );

			await test.step( `${ ImageBlock.blockName } block: upload image file using Calypso media modal`, async () => {
				const blockHandle = await pageEditor.addBlockFromSidebar(
					ImageBlock.blockName,
					ImageBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const imageBlock = new ImageBlock( page, blockHandle );
				await imageBlock.uploadThroughMediaLibrary( testFiles!.image.fullpath );
			} );

			await test.step( `${ AudioBlock.blockName } block: upload audio file`, async () => {
				const blockHandle = await pageEditor.addBlockFromSidebar(
					AudioBlock.blockName,
					AudioBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const audioBlock = new AudioBlock( page, blockHandle );
				await audioBlock.upload( testFiles!.audio.fullpath );
			} );

			await test.step( `${ FileBlock.blockName } block: upload audio file`, async () => {
				const blockHandle = await pageEditor.addBlockFromSidebar(
					FileBlock.blockName,
					FileBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const fileBlock = new FileBlock( page, blockHandle );
				await fileBlock.upload( testFiles!.audio.fullpath );
			} );

			// Skipped: failing all year, seems to be a problem with backend and test site cleanup.
			// p1707923887553869-slack-C034JEXD1RD
			// await test.step( `${ VideoPressBlock.blockName } block: upload video file`, async () => { ... } );

			await test.step( 'Then I publish and visit the post', async () => {
				await pageEditor.saveDraft();
				await pageEditor.publish( { visit: true } );
			} );

			await test.step( 'Then image with reserved characters in filename is visible', async () => {
				await Promise.any( [
					// WP < 6.6
					ImageBlock.validatePublishedContent( page, [
						testFiles!.imageReservedName.filename.replace( /[^a-zA-Z ]/g, '' ),
					] ),
					// WP 6.6+, see https://github.com/WordPress/wordpress-develop/commit/2358de1767168232ff0e7c17e550b8a99f96002e
					ImageBlock.validatePublishedContent( page, [ testFiles!.imageReservedName.filename ] ),
				] );
			} );

			await test.step( 'Then image added via Calypso modal is visible', async () => {
				await ImageBlock.validatePublishedContent( page, [ testFiles!.image.filename ] );
			} );

			await test.step( 'Then audio block is visible', async () => {
				await AudioBlock.validatePublishedContent( page );
			} );

			await test.step( 'Then file block is visible', async () => {
				await FileBlock.validatePublishedContent( page, [ testFiles!.audio.filename ] );
			} );

			// Skipped above: VideoPress block is visible
			void VideoPressBlock;
			void expect;
		} );
	}
);
