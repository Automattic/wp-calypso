/**
 * @group gutenberg
 */

import {
	DataHelper,
	GutenbergEditorPage,
	setupHooks,
	EditorSettingsSidebarComponent,
	TestAccount,
	BrowserHelper,
	SnackbarNoticeComponent,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( `Editor: Trash Post` ), function () {
	const accountName = BrowserHelper.targetGutenbergEdge()
		? 'gutenbergSimpleSiteEdgeUser'
		: 'simpleSitePersonalPlanUser';
	const postTitle = `Trashed post - ${ DataHelper.getTimestamp() }`;

	let page: Page;
	let gutenbergEditorPage: GutenbergEditorPage;
	let editorSettingsSidebarComponent: EditorSettingsSidebarComponent;

	setupHooks( async ( args ) => {
		page = args.page;

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
		gutenbergEditorPage = new GutenbergEditorPage( page );
		await gutenbergEditorPage.visit( 'post' );
	} );

	it( 'Enter post title', async function () {
		await gutenbergEditorPage.enterTitle( postTitle );
	} );

	it( 'Save draft', async function () {
		await gutenbergEditorPage.saveDraft();
	} );

	it( 'Trash post', async function () {
		await gutenbergEditorPage.openSettings();
		const frame = await gutenbergEditorPage.getEditorFrame();

		editorSettingsSidebarComponent = new EditorSettingsSidebarComponent( frame, page );
		await editorSettingsSidebarComponent.clickTab( 'Post' );
		await editorSettingsSidebarComponent.trashPost();
	} );

	it( 'User is navigated to trashed posts page', async function () {
		await page.waitForNavigation( { url: /.*\/posts\/trashed\// } );
	} );

	it( 'Success notice is shown', async function () {
		const snackbarNoticeComponent = new SnackbarNoticeComponent( page );
		const success = await snackbarNoticeComponent.validateNoticeShown(
			'Post successfully moved to trash.',
			{ type: 'Success' }
		);

		expect( success ).toStrictEqual( true );
	} );
} );
