/**
 * @group gutenberg
 */

import {
	DataHelper,
	TestAccount,
	envVariables,
	GutenbergEditorPage,
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
	let postURL: URL;
	let editorPage: GutenbergEditorPage;
	let page: Page;

	beforeAll( async function () {
		page = await browser.newPage();

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async function () {
		editorPage = new GutenbergEditorPage( page );
		await editorPage.visit( 'post' );
	} );

	it( 'Enter page title', async function () {
		editorPage = new GutenbergEditorPage( page );
		await editorPage.enterTitle( postTitle );
	} );

	it( 'Enter page content', async function () {
		await editorPage.enterText( postContent );
	} );

	describe( 'Schedule: future', function () {
		it( 'Open settings', async function () {
			await editorPage.openSettings();
		} );

		it( 'Schedule the post for next year', async function () {
			const date = new Date();
			date.setUTCFullYear( date.getFullYear() + 1 );

			await editorPage.schedule( {
				year: date.getUTCFullYear(),
				month: date.getUTCMonth(),
				date: date.getUTCDate(),
				hours: 12,
				minutes: 1,
				meridian: 'am',
			} );
			// On mobile, the sidebar covers all of the screen.
			// Dismiss it so publish buttons are available.
			await editorPage.closeSettings();
		} );

		it( 'Publish post', async function () {
			postURL = await editorPage.publish();
			await editorPage.closeAllPanels();
		} );

		it( `View post as ${ accountName }`, async function () {
			const testPage = await browser.newPage();

			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( testPage );

			await testPage.goto( postURL.href );
			const publishedPostPage = new PublishedPostPage( testPage );
			await publishedPostPage.validateTextInPost( postContent );
			await testPage.close();
		} );

		it( 'View post as public', async function () {
			const testPage = await browser.newPage();

			await testPage.goto( postURL.href );
			const publishedPostPage = new PublishedPostPage( testPage );
			await publishedPostPage.validateTextInPost(
				'It looks like nothing was found at this location. Maybe try a search?'
			);
			await testPage.close();
		} );
	} );

	describe( 'Schedule: past', function () {
		it( 'Open settings', async function () {
			await editorPage.openSettings();
		} );

		it( 'Schedule post to fist of the current month of last year', async function () {
			const date = new Date();
			date.setUTCFullYear( date.getUTCFullYear() - 1 );

			await editorPage.schedule( {
				year: date.getUTCFullYear(),
				date: 1,
				month: date.getUTCMonth(),
				hours: 12,
				minutes: 59,
				meridian: 'pm',
			} );
			// On mobile, the sidebar covers all of the screen.
			// Dismiss it so publish buttons are available.
			await editorPage.closeSettings();
		} );

		it( 'Publish post', async function () {
			postURL = await editorPage.publish();
		} );

		it.each( [ 'public', accountName, 'defaultUser' ] )(
			'View post as %s',
			async function ( user ) {
				const testPage = await browser.newPage();

				if ( user !== 'public' ) {
					const testAccount = new TestAccount( accountName );
					await testAccount.authenticate( testPage );
				}

				await testPage.goto( postURL.href );
				const publishedPostPage = new PublishedPostPage( testPage );
				await publishedPostPage.validateTextInPost( postContent );

				await testPage.close();
			}
		);
	} );
} );
