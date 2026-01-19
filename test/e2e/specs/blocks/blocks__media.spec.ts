import {
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
import { TEST_IMAGE_PATH, TEST_AUDIO_PATH, TEST_VIDEO_PATH } from '../constants';

test.describe(
	'Blocks: Media (Upload)',
	{ tag: [ tags.CALYPSO_PR, tags.GUTENBERG, tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		test( 'As a user, I can add and configure media blocks', async ( { page, helperData } ) => {
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

			let testAccount: TestAccount;
			let editorPage: EditorPage;
			let testFiles: {
				image: TestFile;
				imageReservedName: TestFile;
				audio: TestFile;
				video: TestFile;
			};

			await test.step( 'Given I have test files', async function () {
				testFiles = {
					image: await MediaHelper.createTestFile( TEST_IMAGE_PATH ),
					imageReservedName: await MediaHelper.createTestFile( TEST_IMAGE_PATH, {
						postfix: 'filewith#?#?reservedurlchars',
					} ),
					audio: await MediaHelper.createTestFile( TEST_AUDIO_PATH ),
					video: await MediaHelper.createTestFile( TEST_VIDEO_PATH ),
				};
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

			await test.step( `And I add ${ ImageBlock.blockName } block with reserved URL characters in filename`, async function () {
				const blockHandle = await editorPage.addBlockFromSidebar(
					ImageBlock.blockName,
					ImageBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const imageBlock = new ImageBlock( page, blockHandle );
				await imageBlock.upload( testFiles.imageReservedName.fullpath );
			} );

			await test.step( `And I add ${ ImageBlock.blockName } block using Calypso media modal`, async function () {
				const blockHandle = await editorPage.addBlockFromSidebar(
					ImageBlock.blockName,
					ImageBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const imageBlock = new ImageBlock( page, blockHandle );
				await imageBlock.uploadThroughMediaLibrary( testFiles.image.fullpath );
			} );

			await test.step( `And I add ${ AudioBlock.blockName } block`, async function () {
				const blockHandle = await editorPage.addBlockFromSidebar(
					AudioBlock.blockName,
					AudioBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const audioBlock = new AudioBlock( page, blockHandle );
				await audioBlock.upload( testFiles.audio.fullpath );
			} );

			await test.step( `And I add ${ FileBlock.blockName } block`, async function () {
				const blockHandle = await editorPage.addBlockFromSidebar(
					FileBlock.blockName,
					FileBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const fileBlock = new FileBlock( page, blockHandle );
				await fileBlock.upload( testFiles.audio.fullpath );
			} );

			// Skipping VideoPress block: This has been failing all year, seems to be a problem with the backend.
			// See: p1707923887553869-slack-C034JEXD1RD

			await test.step( 'And I publish and visit the post', async function () {
				await editorPage.saveDraft();
				await editorPage.publish( { visit: true } );
			} );

			await test.step( 'Then the image with reserved characters is visible', async function () {
				await Promise.any( [
					// WP < 6.6
					ImageBlock.validatePublishedContent( page, [
						testFiles.imageReservedName.filename.replace( /[^a-zA-Z ]/g, '' ),
					] ),
					// WP 6.6+, see https://github.com/WordPress/wordpress-develop/commit/2358de1767168232ff0e7c17e550b8a99f96002e
					ImageBlock.validatePublishedContent( page, [ testFiles.imageReservedName.filename ] ),
				] );
			} );

			await test.step( 'And the image added via Calypso modal is visible', async function () {
				await ImageBlock.validatePublishedContent( page, [ testFiles.image.filename ] );
			} );

			await test.step( 'And the audio block is visible', async function () {
				await AudioBlock.validatePublishedContent( page );
			} );

			await test.step( 'And the file block is visible', async function () {
				await FileBlock.validatePublishedContent( page, [ testFiles.audio.filename ] );
			} );
		} );
	}
);
