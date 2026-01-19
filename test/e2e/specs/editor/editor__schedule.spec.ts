import { EditorPage, PublishedPostPage, TestAccount } from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe( 'Editor: Schedule', { tag: [ tags.GUTENBERG ] }, () => {
	test( 'As a user, I can schedule posts for future and past publication', async ( {
		browser,
		page,
		accountGivenByEnvironment,
		helperData,
	} ) => {
		const postTitle = `Scheduled Post: ${ helperData.getTimestamp() }`;
		const postContent = helperData.getRandomPhrase();
		let postURL: URL;
		let editorPage: EditorPage;
		const context = page.context();

		await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
			await accountGivenByEnvironment.authenticate( page );
		} );

		await test.step( 'When I go to the new post page', async function () {
			editorPage = new EditorPage( page );
			await editorPage.visit( 'post' );
		} );

		await test.step( 'And I enter post title', async function () {
			await editorPage.enterTitle( postTitle );
		} );

		await test.step( 'And I enter post content', async function () {
			await editorPage.enterText( postContent );
		} );

		await test.step( 'And I open post settings', async function () {
			await editorPage.openSettings();
		} );

		await test.step( 'And I schedule the post for next year', async function () {
			const date = new Date();
			date.setUTCFullYear( date.getFullYear() + 1 );

			await editorPage.schedule( {
				year: date.getUTCFullYear(),
				month: date.getUTCMonth(),
				date: date.getUTCDate(),
				hours: 12,
				minutes: 1,
				meridian: 'AM',
			} );
		} );

		await test.step( 'And I close settings', async function () {
			await editorPage.closeSettings();
		} );

		await test.step( 'And I publish the post', async function () {
			postURL = await editorPage.publish();
			await editorPage.closeAllPanels();
		} );

		await test.step( 'Then as the author I can view the post', async function () {
			const tmpPage = await context.newPage();
			await tmpPage.goto( postURL.href );
			await new PublishedPostPage( tmpPage ).validateTextInPost( postContent );
			await tmpPage.close();
		} );

		await test.step( 'And as a guest, the post shows as 404', async function () {
			const tmpPage = await browser.newPage();
			await tmpPage.goto( postURL.href );
			await tmpPage.locator( 'body.error404' ).waitFor();
			await tmpPage.close();
		} );

		await test.step( 'When I open settings again', async function () {
			await editorPage.openSettings();
		} );

		await test.step( 'And I schedule post to first of the current month of last year', async function () {
			const date = new Date();
			date.setUTCFullYear( date.getUTCFullYear() - 1 );

			await editorPage.schedule( {
				year: date.getUTCFullYear(),
				date: 1,
				month: date.getUTCMonth(),
				hours: 12,
				minutes: 59,
				meridian: 'PM',
			} );
		} );

		await test.step( 'And I close settings', async function () {
			await editorPage.closeSettings();
		} );

		await test.step( 'And I publish the post', async function () {
			postURL = await editorPage.publish();
		} );

		await test.step( 'Then as the author I can view the post', async function () {
			const tmpPage = await context.newPage();
			await tmpPage.goto( postURL.href );
			await new PublishedPostPage( tmpPage ).validateTextInPost( postContent );
			await tmpPage.close();
		} );

		await test.step( 'And as a guest I can view the post', async function () {
			const tmpPage = await browser.newPage();
			await tmpPage.goto( postURL.href );
			await new PublishedPostPage( tmpPage ).validateTextInPost( postContent );
			await tmpPage.close();
		} );

		await test.step( 'And as another authenticated user I can view the post', async function () {
			const tmpPage = await browser.newPage();

			const testAccount = new TestAccount( 'defaultUser' );
			await testAccount.authenticate( tmpPage );

			await tmpPage.goto( postURL.href );
			await new PublishedPostPage( tmpPage ).validateTextInPost( postContent );
			await tmpPage.close();
		} );
	} );
} );
