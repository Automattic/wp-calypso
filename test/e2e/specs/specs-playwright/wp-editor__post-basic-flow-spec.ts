/**
 * @group calypso-pr
 * @group calypso-release
 * @group gutenberg
 */

import {
	BrowserHelper,
	DataHelper,
	GutenbergEditorPage,
	EditorSettingsSidebarComponent,
	LoginPage,
	NewPostFlow,
	setupHooks,
	PublishedPostPage,
	itif,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

const quote =
	'The problem with quotes on the Internet is that it is hard to verify their authenticity. \n— Abraham Lincoln';
const title = DataHelper.getRandomPhrase();
const category = 'Uncategorized';
const tag = 'test-tag';

describe( DataHelper.createSuiteTitle( 'Editor: Basic Post Flow' ), function () {
	let page: Page;
	let gutenbergEditorPage: GutenbergEditorPage;
	let editorSettingsSidebarComponent: EditorSettingsSidebarComponent;
	let publishedPostPage: PublishedPostPage;
	const user = BrowserHelper.targetGutenbergEdge()
		? 'gutenbergSimpleSiteEdgeUser'
		: 'gutenbergSimpleSiteUser';

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Starting and populating post data', function () {
		it( 'Log in', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.login( { account: user } );
		} );

		it( 'Start new post', async function () {
			const newPostFlow = new NewPostFlow( page );
			await newPostFlow.newPostFromNavbar();
		} );

		it( 'Enter post title', async function () {
			gutenbergEditorPage = new GutenbergEditorPage( page );
			await gutenbergEditorPage.enterTitle( title );
		} );

		it( 'Enter post text', async function () {
			await gutenbergEditorPage.enterText( quote );
		} );

		it( 'Open editor settings sidebar for post', async function () {
			await gutenbergEditorPage.openSettings();
			const frame = await gutenbergEditorPage.getEditorFrame();
			editorSettingsSidebarComponent = new EditorSettingsSidebarComponent( frame, page );
			await editorSettingsSidebarComponent.clickTab( 'Post' );
		} );

		it( 'Add post category', async function () {
			await editorSettingsSidebarComponent.expandSectionIfCollapsed( 'Categories' );
			await editorSettingsSidebarComponent.clickCategory( category );
		} );

		it( 'Add post tag', async function () {
			await editorSettingsSidebarComponent.expandSectionIfCollapsed( 'Tags' );
			await editorSettingsSidebarComponent.enterTag( tag );
		} );
	} );

	describe( 'Preview post', function () {
		const targetDevice = BrowserHelper.getTargetDeviceName();
		let previewPage: Page;

		// This step is required on mobile, but doesn't hurt anything on desktop, so avoiding conditional.
		it( 'Close settings sidebar', async function () {
			await editorSettingsSidebarComponent.closeSidebar();
		} );

		// The following two steps have conditiionals inside them, as how the
		// Editor Preview behaves depends on the device type.
		// On desktop and tablet, preview applies CSS attributes to modify the preview in-editor.
		// On mobile web, preview button opens a new tab.

		// TODO: step skipped for non-mobile due to https://github.com/Automattic/wp-calypso/issues/57128.
		itif( targetDevice === 'mobile' )( 'Launch preview', async function () {
			if ( BrowserHelper.getTargetDeviceName() === 'mobile' ) {
				previewPage = await gutenbergEditorPage.openPreviewAsMobile();
			} else {
				await gutenbergEditorPage.openPreviewAsDesktop( 'Mobile' );
			}
		} );

		// TODO: step skipped for non-mobile due to https://github.com/Automattic/wp-calypso/issues/57128.
		itif( targetDevice === 'mobile' )( 'Close preview', async function () {
			// Mobile path.
			if ( previewPage ) {
				await previewPage.close();
				// Desktop path.
			} else {
				await gutenbergEditorPage.closePreview();
			}
		} );

		// TODO: step skipped for mobile, since previewing naturally saves the post, rendering this step unnecessary.
		itif( targetDevice !== 'mobile' )( 'Save draft', async function () {
			await gutenbergEditorPage.saveDraft();
		} );
	} );

	describe( 'Publish post', function () {
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
