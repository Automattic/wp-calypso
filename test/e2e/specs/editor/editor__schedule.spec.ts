import {
	DataHelper,
	EditorPage,
	PublishedPostPage,
	TestAccount,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Editor: Schedule' ),
	{ tag: [ tags.GUTENBERG ] },
	() => {
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

		test( 'As a user, I can schedule posts in the future and past', async ( {
			page,
			pageEditor,
		} ) => {
			let postURL: URL;

			await test.step( 'Given I am authenticated', async () => {
				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
			} );

			await test.step( 'When I go to the new post page', async () => {
				await pageEditor.visit( 'post' );
			} );

			await test.step( 'When I enter page title', async () => {
				await pageEditor.enterTitle( postTitle );
			} );

			await test.step( 'When I enter page content', async () => {
				await pageEditor.enterText( postContent );
			} );

			// Schedule: future
			await test.step( 'When I open settings to schedule', async () => {
				await pageEditor.openSettings();
			} );

			await test.step( 'When I schedule the post for next year', async () => {
				const date = new Date();
				date.setUTCFullYear( date.getFullYear() + 1 );

				await pageEditor.schedule( {
					year: date.getUTCFullYear(),
					month: date.getUTCMonth(),
					date: date.getUTCDate(),
					hours: 12,
					minutes: 1,
					meridian: 'AM',
				} );
			} );

			await test.step( 'When I close settings', async () => {
				await pageEditor.closeSettings();
			} );

			await test.step( 'When I publish post (future-scheduled)', async () => {
				postURL = await pageEditor.publish();
				await pageEditor.closeAllPanels();
			} );

			await test.step( 'Then I can view the post as the author', async () => {
				const tmpPage = await page.context().newPage();
				await tmpPage.goto( postURL!.href );
				await new PublishedPostPage( tmpPage ).validateTextInPost( postContent );
				await tmpPage.close();
			} );

			await test.step( 'Then the post is not visible to the public (404)', async () => {
				const browser = page.context().browser();
				const incognito = await browser!.newContext();
				const tmpPage = await incognito.newPage();
				await tmpPage.goto( postURL!.href );
				await tmpPage.locator( 'body.error404' ).waitFor();
				await tmpPage.close();
				await incognito.close();
			} );

			// Schedule: past
			await test.step( 'When I open settings to reschedule to past', async () => {
				const editorPage = new EditorPage( page );
				await editorPage.openSettings();
			} );

			await test.step( 'When I schedule post to first of last year', async () => {
				const date = new Date();
				date.setUTCFullYear( date.getUTCFullYear() - 1 );

				await pageEditor.schedule( {
					year: date.getUTCFullYear(),
					date: 1,
					month: date.getUTCMonth(),
					hours: 12,
					minutes: 59,
					meridian: 'PM',
				} );
			} );

			await test.step( 'When I close settings', async () => {
				await pageEditor.closeSettings();
			} );

			await test.step( 'When I publish post (past-scheduled)', async () => {
				postURL = await pageEditor.publish();
			} );

			await test.step( 'Then the past-scheduled post is visible to the author', async () => {
				const tmpPage = await page.context().newPage();
				await tmpPage.goto( postURL!.href );
				await new PublishedPostPage( tmpPage ).validateTextInPost( postContent );
				await tmpPage.close();
			} );

			await test.step( 'Then the past-scheduled post is visible as a guest', async () => {
				const browser = page.context().browser();
				const incognito = await browser!.newContext();
				const tmpPage = await incognito.newPage();
				await tmpPage.goto( postURL!.href );
				await new PublishedPostPage( tmpPage ).validateTextInPost( postContent );
				await tmpPage.close();
				await incognito.close();
			} );

			await test.step( 'Then the past-scheduled post is visible to another user', async () => {
				const browser = page.context().browser();
				const incognito = await browser!.newContext();
				const tmpPage = await incognito.newPage();
				const testAccount = new TestAccount( 'defaultUser' );
				await testAccount.authenticate( tmpPage );
				await tmpPage.goto( postURL!.href );
				await new PublishedPostPage( tmpPage ).validateTextInPost( postContent );
				await tmpPage.close();
				await incognito.close();
			} );
		} );
	}
);
