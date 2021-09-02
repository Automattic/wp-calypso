import {
	DataHelper,
	GutenbergEditorPage,
	EditorSettingsSidebarComponent,
	LoginFlow,
	NewPostFlow,
	setupHooks,
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
	let settingsSidebar: EditorSettingsSidebarComponent;
	const user = 'gutenbergSimpleSiteUser';

	setupHooks( ( args ) => {
		page = args.page;
	} );

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
		settingsSidebar = new EditorSettingsSidebarComponent( frame, page );
		await settingsSidebar.clickTab( 'Post' );
	} );

	it( 'Add post category', async function () {
		await settingsSidebar.expandSectionIfCollapsed( 'Categories' );
		await settingsSidebar.checkCategory( category );
	} );

	it( 'Add post tag', async function () {
		await settingsSidebar.expandSectionIfCollapsed( 'Tags' );
		await settingsSidebar.enterTag( tag );
	} );

	// it( 'Publish and visit post', async function () {
	// 	const publishedURL = await gutenbergEditorPage.publish( { visit: true } );
	// 	expect( publishedURL ).toBe( await page.url() );
	// } );
} );
