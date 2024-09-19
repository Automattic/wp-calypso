/**
 * @group gutenberg
 */

import {
	DataHelper,
	TestAccount,
	envVariables,
	EditorPage,
	PublishedPostPage,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { Browser, BrowserContext, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( `Editor: Schedule` ), function () {
	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( features, [
		{
			gutenberg: 'stable',
			siteType: 'simple',
			accountName: 'simpleSitePersonalPlanUser',
		},
	] );

	const postTitle = `Scheduled Post: ${ DataHelper.getTimestamp() }`;
	const postContent = DataHelper.getRandomPhrase();
	let postURL: URL;
	let editorPage: EditorPage;
	let context: BrowserContext;
	let page: Page;

	beforeAll( async function () {
		context = await browser.newContext();
		page = await context.newPage();

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async function () {
		editorPage = new EditorPage( page );
		await editorPage.visit( 'post' );
	} );

	it( 'Enter page title', async function () {
		editorPage = new EditorPage( page );
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
		} );

		it( 'Close settings', async function () {
			// On mobile, the sidebar covers all of the screen.
			// Dismiss it so publish buttons are available.
			await editorPage.closeSettings();
		} );

		it( 'Publish post', async function () {
			postURL = await editorPage.publish();
			await editorPage.closeAllPanels();
		} );

		it( `View post as the author`, async function () {
			const tmpPage = await context.newPage(); // Calling from context opens new tab (same session)

			await tmpPage.goto( postURL.href );
			await new PublishedPostPage( tmpPage ).validateTextInPost( postContent );

			await tmpPage.close();
		} );

		it( 'View post as public', async function () {
			const tmpPage = await browser.newPage(); // Calling from browser opens new incognito window

			await tmpPage.goto( postURL.href );
			await tmpPage.locator( 'body.error404' ).waitFor();
			await tmpPage.close();
		} );
	} );

	describe( 'Schedule: past', function () {
		it( 'Open settings', async function () {
			await editorPage.openSettings();
		} );

		it( 'Schedule post to first of the current month of last year', async function () {
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
		} );

		it( 'Close settings', async () => {
			// On mobile, the sidebar covers all of the screen.
			// Dismiss it so publish buttons are available.
			await editorPage.closeSettings();
		} );

		it( 'Publish post', async function () {
			postURL = await editorPage.publish();
		} );

		it( 'View post as the author', async () => {
			const tmpPage = await context.newPage();

			await tmpPage.goto( postURL.href );
			await new PublishedPostPage( tmpPage ).validateTextInPost( postContent );

			await tmpPage.close();
		} );

		it( 'View post as a guest', async () => {
			const tmpPage = await browser.newPage();

			await tmpPage.goto( postURL.href );
			await new PublishedPostPage( tmpPage ).validateTextInPost( postContent );

			await tmpPage.close();
		} );

		it( 'View post as another user', async () => {
			const tmpPage = await browser.newPage();

			const testAccount = new TestAccount( 'defaultUser' );
			await testAccount.authenticate( tmpPage );

			await tmpPage.goto( postURL.href );
			await new PublishedPostPage( tmpPage ).validateTextInPost( postContent );

			await tmpPage.close();
		} );
	} );
} );
