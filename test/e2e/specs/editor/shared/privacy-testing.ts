import {
	DataHelper,
	GutenbergEditorPage,
	TestAccount,
	envVariables,
	PrivacyOptions,
	PublishedPostPage,
	PageTemplateModalComponent,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

const pageContent = DataHelper.getRandomPhrase();
const pagePassword = 'cat';

/**
 * Creates Page privacy tests.
 *
 * Accepts as parameter the intended page/post privacy option.
 *
 * @param param0 Keyed object parameter.
 * @param {PrivacyOptions} param0.visibility Intended page/post privacy option.
 */
export function createPrivacyTests( { visibility }: { visibility: PrivacyOptions } ): void {
	describe( DataHelper.createSuiteTitle( `Editor: Privacy (${ visibility })` ), function () {
		const accountName = envVariables.GUTENBERG_EDGE
			? 'gutenbergSimpleSiteEdgeUser'
			: 'simpleSitePersonalPlanUser';

		let page: Page;
		let url: URL;
		let gutenbergEditorPage: GutenbergEditorPage;

		describe( `Create a ${ visibility } page`, function () {
			beforeAll( async function () {
				page = await browser.newPage();

				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
			} );

			it( 'Start new page', async function () {
				gutenbergEditorPage = new GutenbergEditorPage( page );
				await gutenbergEditorPage.visit( 'page' );
				const editorIframe = await gutenbergEditorPage.waitUntilLoaded();
				const pageTemplateModalComponent = new PageTemplateModalComponent( editorIframe, page );
				await pageTemplateModalComponent.selectBlankPage();
			} );

			it( 'Enter page title', async function () {
				gutenbergEditorPage = new GutenbergEditorPage( page );
				await gutenbergEditorPage.enterTitle(
					`Privacy: ${ visibility } - ${ DataHelper.getTimestamp() }`
				);
			} );

			it( 'Enter page content', async function () {
				await gutenbergEditorPage.enterText( pageContent );
			} );

			it( `Set page visibility to ${ visibility }`, async function () {
				await gutenbergEditorPage.openSettings();
				await gutenbergEditorPage.setArticleVisibility( visibility as PrivacyOptions, {
					password: pagePassword,
				} );
				await gutenbergEditorPage.closeSettings();
			} );

			it( 'Publish page', async function () {
				// Private articles are published immediately as the option is selected.
				// In other words, for Private articles the publish action happened in previous step.
				if ( visibility === 'Private' ) {
					url = await gutenbergEditorPage.getPublishedURLFromToast();
				} else {
					url = await gutenbergEditorPage.publish();
				}
			} );
		} );

		describe( 'Validate page content', function () {
			let testPage: Page;

			beforeEach( async function () {
				testPage = await browser.newPage();
			} );

			it.each( [ 'defaultUser', 'public' ] )(
				`View ${ visibility } page as %s`,
				async function ( user ) {
					try {
						const testAccount = new TestAccount( user );
						await testAccount.authenticate( testPage );
					} catch {
						// noop - public user, which is state of not logged in, does not
						// have an entry in the secrets file.
					}
					await testPage.goto( url.href );
					const publishedPostPage = new PublishedPostPage( testPage );

					// If target article is private, only the posting user can see that it even exists.
					if ( visibility === 'Private' ) {
						return await publishedPostPage.validateTextInPost( 'Nothing here' );
					}

					// If target article is password protected, unlock it first.
					if ( visibility === 'Password' ) {
						await publishedPostPage.enterPostPassword( pagePassword );
					}
					await publishedPostPage.validateTextInPost( pageContent );
				}
			);

			it( `View ${ visibility } page as publishing user`, async function () {
				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( testPage );
				await testPage.goto( url.href );
				const publishedPostPage = new PublishedPostPage( testPage );

				// Posting user can see all of their pages, regardless of privacy setting.
				// However, password protected pages still need to be unlocked.
				if ( visibility === 'Password' ) {
					await publishedPostPage.enterPostPassword( pagePassword );
				}
				await publishedPostPage.validateTextInPost( pageContent );
			} );
		} );
	} );
}
