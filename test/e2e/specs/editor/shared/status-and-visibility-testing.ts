import {
	DataHelper,
	EditorPage,
	TestAccount,
	envVariables,
	PublishedPostPage,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import type { ArticlePrivacyOptions } from '@automattic/calypso-e2e';

declare const browser: Browser;

type ArticleStatusOptions = 'draft' | 'pending' | 'private' | 'publish' | 'future';

const pageContent = DataHelper.getRandomPhrase();
const pagePassword = 'cat';

/**
 * Creates Page status tests.
 *
 * Accepts as parameter the intended page/post status option.
 *
 * @param param0 Keyed object parameter.
 * @param {ArticleStatusOptions} param0.status Intended page/post status option.
 */
export function createStatusTests( { status }: { status: ArticleStatusOptions } ): void {
	describe( DataHelper.createSuiteTitle( `Editor: Status (${ status })` ), function () {
		const features = envToFeatureKey( envVariables );
		const accountName = getTestAccountByFeature( features, [
			{ gutenberg: 'stable', siteType: 'simple', accountName: 'simpleSitePersonalPlanUser' },
		] );

		let page: Page;
		let url: URL;
		let editorPage: EditorPage;

		describe( `Create a ${ status } page`, function () {
			beforeAll( async function () {
				page = await browser.newPage();

				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
			} );

			afterAll( async function () {
				await page.close();
			} );

			it( 'Start new page', async function () {
				editorPage = new EditorPage( page );
				await editorPage.visit( 'page' );
				await editorPage.selectBlankPageTemplate();
			} );

			it( 'Enter page title', async function () {
				editorPage = new EditorPage( page );
				await editorPage.enterTitle( `Privacy: ${ status } - ${ DataHelper.getTimestamp() }` );
			} );

			it( 'Enter page content', async function () {
				await editorPage.enterText( pageContent );
			} );

			it( `Set page status to ${ status }`, async function () {
				await editorPage.openSettings();
				await editorPage.setArticleVisibility( status as ArticlePrivacyOptions, {
					password: pagePassword,
				} );
				await editorPage.closeSettings();
			} );

			it( 'Save/Publish page', async function () {
				// Private articles are published immediately as the option is
				// selected. In other words, for Private articles the publish
				// action happened in previous step.
				if ( status === 'private' ) {
					url = await editorPage.getPublishedURLFromToast();
				} else {
					url = await editorPage.publish();
				}
			} );

			it( `View published page`, async function () {
				await page.goto( url.href );
				const publishedPostPage = new PublishedPostPage( page );

				// Posting user can see all of their pages, regardless of
				// privacy setting. However, password protected pages still need
				// to be unlocked.
				if ( [ 'draft', 'future', 'private', 'publish', 'Password' ].includes( status ) ) {
					await publishedPostPage.enterPostPassword( pagePassword );
				}
				await publishedPostPage.validateTextInPost( pageContent );
			} );
		} );

		describe.skip( `Validate published ${ status } page content for non-authors`, function () {
			let testPage: Page;

			beforeEach( async function () {
				testPage = await browser.newPage();
			} );

			afterEach( async function () {
				await testPage.close();
			} );

			const viewPageAsNonAuthor = async ( accountName?: string ) => {
				if ( accountName ) {
					const testAccount = new TestAccount( 'defaultUser' );
					await testAccount.authenticate( testPage );
				}

				await testPage.goto( url.href );

				if ( status !== 'Private' ) {
					const publishedPostPage = new PublishedPostPage( testPage );
					// If target article is password protected, unlock it first.
					if ( status === 'Password' ) {
						await publishedPostPage.enterPostPassword( pagePassword );
					}
					await publishedPostPage.validateTextInPost( pageContent );
				} else {
					// If target article is private, only the posting user can
					// see that it even exists.
					await testPage.waitForSelector( 'body.error404' );
				}
			};

			it( `View page as an authenticated user`, async function () {
				await viewPageAsNonAuthor( 'defaultUser' );
			} );

			it( `View page as an unauthenticated user`, async function () {
				await viewPageAsNonAuthor();
			} );
		} );
	} );
}
