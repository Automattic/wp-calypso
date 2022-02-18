/**
 * @group gutenberg
 */

import {
	DataHelper,
	TestAccount,
	envVariables,
	GutenbergEditorPage,
	EditorSettingsSidebarComponent,
	PublishedPostPage,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( `Editor: Schedule` ), function () {
	const accountName = envVariables.GUTENBERG_EDGE
		? 'gutenbergSimpleSiteEdgeUser'
		: 'simpleSitePersonalPlanUser';
	const postTitle = `Scheduled Post: ${ DataHelper.getTimestamp() }`;
	const postContent = DataHelper.getRandomPhrase();
	let postURL: string;
	let gutenbergEditorPage: GutenbergEditorPage;
	let page: Page;

	beforeAll( async function () {
		page = await browser.newPage();

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async function () {
		gutenbergEditorPage = new GutenbergEditorPage( page );
		await gutenbergEditorPage.visit( 'post' );
	} );

	it( 'Enter page title', async function () {
		gutenbergEditorPage = new GutenbergEditorPage( page );
		await gutenbergEditorPage.enterTitle( postTitle );
	} );

	it( 'Enter page content', async function () {
		await gutenbergEditorPage.enterText( postContent );
	} );

	describe( 'Schedule: future', function () {
		let editorSettingsSidebarComponent: EditorSettingsSidebarComponent;

		it( 'Open scheduler', async function () {
			const frame = await gutenbergEditorPage.getEditorFrame();
			await gutenbergEditorPage.openSettings();
			editorSettingsSidebarComponent = new EditorSettingsSidebarComponent( frame, page );
			await editorSettingsSidebarComponent.clickTab( 'Post' );
			await editorSettingsSidebarComponent.openSchedule();
		} );

		it( 'Schedule the post for next year', async function () {
			const date = new Date();
			date.setUTCFullYear( date.getFullYear() + 1 );

			await editorSettingsSidebarComponent.schedule( {
				year: date.getUTCFullYear(),
				month: date.getUTCMonth(),
				date: date.getUTCDate(),
				hours: 12,
				minutes: 1,
				meridian: 'am',
			} );
			// On mobile, the sidebar covers all of the screen.
			await editorSettingsSidebarComponent.closeSidebar();
		} );

		it( 'Publish post', async function () {
			postURL = await gutenbergEditorPage.publish();
		} );

		it( `View post as ${ accountName }`, async function () {
			const testPage = await browser.newPage();

			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( testPage );

			await testPage.goto( postURL );
			const publishedPostPage = new PublishedPostPage( testPage );
			await publishedPostPage.validateTextInPost( postContent );
			await testPage.close();
		} );

		it( 'View post as public', async function () {
			const testPage = await browser.newPage();

			await testPage.goto( postURL );
			const publishedPostPage = new PublishedPostPage( testPage );
			await publishedPostPage.validateTextInPost(
				'It looks like nothing was found at this location. Maybe try a search?'
			);
			await testPage.close();
		} );
	} );

	describe( 'Schedule: past', function () {
		let editorSettingsSidebarComponent: EditorSettingsSidebarComponent;

		it( 'Open scheduler', async function () {
			const frame = await gutenbergEditorPage.getEditorFrame();
			await gutenbergEditorPage.openSettings();
			editorSettingsSidebarComponent = new EditorSettingsSidebarComponent( frame, page );

			await editorSettingsSidebarComponent.clickTab( 'Post' );
			await editorSettingsSidebarComponent.openSchedule();
		} );

		it( 'Schedule post to fist of the current month of last year', async function () {
			const date = new Date();
			date.setUTCFullYear( date.getUTCFullYear() - 1 );

			await editorSettingsSidebarComponent.schedule( {
				year: date.getUTCFullYear(),
				date: 1,
				month: date.getUTCMonth(),
				hours: 12,
				minutes: 59,
				meridian: 'pm',
			} );
			await editorSettingsSidebarComponent.closeSidebar();
		} );

		it( 'Publish post', async function () {
			postURL = await gutenbergEditorPage.publish();
		} );

		it.each( [ 'public', accountName, 'defaultUser' ] )(
			'View post as %s',
			async function ( user ) {
				const testPage = await browser.newPage();

				if ( user !== 'public' ) {
					const testAccount = new TestAccount( accountName );
					await testAccount.authenticate( testPage );
				}

				await testPage.goto( postURL );
				const publishedPostPage = new PublishedPostPage( testPage );
				await publishedPostPage.validateTextInPost( postContent );

				await testPage.close();
			}
		);
	} );
} );
