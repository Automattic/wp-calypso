import {
	DataHelper,
	GutenbergEditorPage,
	TestAccount,
	envVariables,
	PrivacyOptions,
	PublishedPostPage,
	EditorSettingsSidebarComponent,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

const postContent = DataHelper.getRandomPhrase();
const postPassword = 'cat';

/**
 * Creates Page privacy tests.
 *
 * Accepts as parameter the intended page/post privacy option.
 *
 * @param param0 Keyed object parameter.
 * @param {PrivacyOptions} param0.visibility Intended page/post privacy option.
 */
export function createPrivacyTests( { visibility }: { visibility: PrivacyOptions } ): void {
	describe( DataHelper.createSuiteTitle( `Editor: Privacy` ), function () {
		const accountName = envVariables.GUTENBERG_EDGE
			? 'gutenbergSimpleSiteEdgeUser'
			: 'simpleSitePersonalPlanUser';

		let page: Page;
		let url: string;
		let gutenbergEditorPage: GutenbergEditorPage;
		let editorSettingsSidebarComponent: EditorSettingsSidebarComponent;

		describe( `Create a ${ visibility } post`, function () {
			beforeAll( async function () {
				page = await browser.newPage();

				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
			} );

			it( 'Go to the new post page', async function () {
				gutenbergEditorPage = new GutenbergEditorPage( page );
				await gutenbergEditorPage.visit( 'page' );
				await gutenbergEditorPage.selectPageDesign( 'blank' );
			} );

			it( 'Enter post title', async function () {
				gutenbergEditorPage = new GutenbergEditorPage( page );
				await gutenbergEditorPage.enterTitle(
					`Privacy: ${ visibility } - ${ DataHelper.getTimestamp() }`
				);
			} );

			it( 'Enter post content', async function () {
				await gutenbergEditorPage.enterText( postContent );
			} );

			it( `Set post visibility to ${ visibility }`, async function () {
				const frame = await gutenbergEditorPage.getEditorFrame();
				editorSettingsSidebarComponent = new EditorSettingsSidebarComponent( frame, page );

				await editorSettingsSidebarComponent.clickTab( 'Page' );
				await editorSettingsSidebarComponent.setVisibility( visibility as PrivacyOptions );

				if ( visibility === 'Password' ) {
					await editorSettingsSidebarComponent.setPostPassword( postPassword );
				}
			} );

			it( 'Publish post', async function () {
				// Private articles are published immediately as the option is selected.
				// In other words, for Private articles the publish action happened in previous step.
				if ( visibility === 'Private' ) {
					url = await gutenbergEditorPage.getPublishedURL();
				} else {
					url = await gutenbergEditorPage.publish();
				}
			} );
		} );

		describe( 'Validate post content', function () {
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
					await testPage.goto( url );
					const publishedPostPage = new PublishedPostPage( testPage );

					// If target article is private, only the posting user can see that it even exists.
					if ( visibility === 'Private' ) {
						return await publishedPostPage.validateTextInPost( 'Nothing here' );
					}

					// If target article is password protected, unlock it first.
					if ( visibility === 'Password' ) {
						await publishedPostPage.enterPostPassword( postPassword );
					}
					await publishedPostPage.validateTextInPost( postContent );
				}
			);

			it( `View ${ visibility } page as posting user`, async function () {
				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( testPage );
				await testPage.goto( url );
				const publishedPostPage = new PublishedPostPage( testPage );

				// Posting user can see all of their pages, regardless of privacy setting.
				// However, password protected pages still need to be unlocked.
				if ( visibility === 'Password' ) {
					await publishedPostPage.enterPostPassword( postPassword );
				}
				await publishedPostPage.validateTextInPost( postContent );
			} );
		} );
	} );
}
