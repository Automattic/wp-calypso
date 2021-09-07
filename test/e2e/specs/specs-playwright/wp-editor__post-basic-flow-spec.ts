import {
	BrowserHelper,
	DataHelper,
	GutenbergEditorPage,
	EditorSettingsSidebarComponent,
	LoginFlow,
	NewPostFlow,
	setupHooks,
	PreviewComponent,
	PublishedPostPage,
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
	let previewComponent: PreviewComponent;
	let publishedPostPage: PublishedPostPage;
	const user = BrowserHelper.targetGutenbergEdge()
		? 'gutenbergSimpleSiteEdgeUser'
		: 'gutenbergSimpleSiteUser';

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Starting and populating post data', function () {
		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( page, user );
			await loginFlow.logIn();
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
		// This step is required on mobile, but doesn't hurt anything on desktop, so avoiding conditional
		it( 'Close settings sidebar', async function () {
			await editorSettingsSidebarComponent.closeSidebar();
		} );

		it( 'Launch preview', async function () {
			await gutenbergEditorPage.preview();
			previewComponent = new PreviewComponent( page );
			await previewComponent.previewReady();
		} );

		it( 'Post content is found in preview', async function () {
			await previewComponent.validateTextInPreviewContent( title );
			await previewComponent.validateTextInPreviewContent( quote );
		} );

		// We won't preview the metadata in the preview because of a race condition with tags.
		// If you are really fast, like Playwright is, you can add a tag and launch a preview before
		// the tag has been saved to the database, meaning it is not in the preview!
		// It's sufficient to verify content in preview, and metadata in published post.

		it( 'Close preview', async function () {
			await previewComponent.closePreview();
		} );
	} );

	describe( 'Publish post', function () {
		it( 'Publish and visit post', async function () {
			const publishedURL = await gutenbergEditorPage.publish( { visit: true } );
			expect( publishedURL ).toBe( await page.url() );
			publishedPostPage = new PublishedPostPage( page );
		} );

		it( 'Post content is found in published post', async function () {
			await publishedPostPage.validateTextInPost( title );
			await publishedPostPage.validateTextInPost( quote );
		} );

		it( 'Post metadata is found in published post', async function () {
			await publishedPostPage.validateTextInPost( category );
			await publishedPostPage.validateTextInPost( tag );
		} );
	} );
} );
