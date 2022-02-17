/**
 * @group gutenberg
 */

import {
	DataHelper,
	GutenbergEditorPage,
	EditorSettingsSidebarComponent,
	PublishedPostPage,
	ImageBlock,
	skipItIf,
	TestAccount,
	envVariables,
} from '@automattic/calypso-e2e';
import { Page, ElementHandle, Browser } from 'playwright';

const quote =
	'The problem with quotes on the Internet is that it is hard to verify their authenticity. \n— Abraham Lincoln';
const title = DataHelper.getRandomPhrase();
const category = 'Uncategorized';
const tag = 'test-tag';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Editor: Basic Post Flow' ), function () {
	let page: Page;
	let gutenbergEditorPage: GutenbergEditorPage;
	let editorSettingsSidebarComponent: EditorSettingsSidebarComponent;
	let publishedPostPage: PublishedPostPage;
	const accountName = envVariables.GUTENBERG_EDGE
		? 'gutenbergSimpleSiteEdgeUser'
		: 'simpleSitePersonalPlanUser';

	beforeAll( async () => {
		page = await browser.newPage();
		gutenbergEditorPage = new GutenbergEditorPage( page );

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async function () {
		await gutenbergEditorPage.visit( 'post' );
	} );

	describe( 'Blocks', function () {
		let blockHandle: ElementHandle;

		it( 'Enter post title', async function () {
			await gutenbergEditorPage.enterTitle( title );
		} );

		it( 'Enter post text', async function () {
			await gutenbergEditorPage.enterText( quote );
		} );

		it( 'Add image block', async function () {
			blockHandle = await gutenbergEditorPage.addBlock(
				ImageBlock.blockName,
				ImageBlock.blockEditorSelector
			);
		} );

		it( 'Remove image block', async function () {
			await gutenbergEditorPage.removeBlock( blockHandle );
		} );
	} );

	describe( 'Patterns', function () {
		const patternName = 'Heading';

		it( `Add ${ patternName }`, async function () {
			await gutenbergEditorPage.addPattern( patternName );
		} );
	} );

	describe( 'Categories and Tags', function () {
		it( 'Open editor settings sidebar for post', async function () {
			await gutenbergEditorPage.openSettings();
			const frame = await gutenbergEditorPage.getEditorFrame();
			editorSettingsSidebarComponent = new EditorSettingsSidebarComponent( frame, page );
			await editorSettingsSidebarComponent.clickTab( 'Post' );
		} );

		it( 'Add post category', async function () {
			await editorSettingsSidebarComponent.expandSection( 'Categories' );
			await editorSettingsSidebarComponent.clickCategory( category );
		} );

		it( 'Add post tag', async function () {
			await editorSettingsSidebarComponent.expandSection( 'Tags' );
			await editorSettingsSidebarComponent.enterTag( tag );
		} );
	} );

	describe( 'Preview', function () {
		let previewPage: Page;

		// This step is required on mobile, but doesn't hurt anything on desktop, so avoiding conditional.
		it( 'Close settings sidebar', async function () {
			await editorSettingsSidebarComponent.closeSidebar();
		} );

		// The following two steps have conditiionals inside them, as how the
		// Editor Preview behaves depends on the device type.
		// On desktop and tablet, preview applies CSS attributes to modify the preview in-editor.
		// On mobile web, preview button opens a new tab.
		it( 'Launch preview', async function () {
			if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
				previewPage = await gutenbergEditorPage.openPreviewAsMobile();
			} else {
				await gutenbergEditorPage.openPreviewAsDesktop( 'Mobile' );
			}
		} );

		skipItIf( envVariables.VIEWPORT_NAME === 'desktop' )( 'Close preview', async function () {
			// Mobile path.
			if ( previewPage ) {
				await previewPage.close();
				// Desktop path.
			} else {
				await gutenbergEditorPage.closePreview();
			}
		} );

		// Step skipped for mobile, since previewing naturally saves the post, rendering this step unnecessary.
		skipItIf( envVariables.VIEWPORT_NAME === 'mobile' )( 'Save draft', async function () {
			await gutenbergEditorPage.saveDraft();
		} );
	} );

	describe( 'Publish', function () {
		it( 'Publish and visit post', async function () {
			const publishedURL = await gutenbergEditorPage.publish( { visit: true } );
			expect( publishedURL ).toBe( page.url() );
		} );

		it( 'Post content is found in published post', async function () {
			publishedPostPage = new PublishedPostPage( page );
			await publishedPostPage.validateTextInPost( title );
			await publishedPostPage.validateTextInPost( quote );
		} );

		it( 'Post metadata is found in published post', async function () {
			await publishedPostPage.validateTextInPost( category );
			await publishedPostPage.validateTextInPost( tag );
		} );
	} );
} );
