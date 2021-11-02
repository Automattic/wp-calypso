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
			await gutenbergEditorPage.openNavSidebar();
			await gutenbergEditorPage.returnToHomeDashboard();
		} );
	} );
} );
