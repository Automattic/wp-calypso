import {
	DataHelper,
	ParagraphBlock,
	PublishedPostPage,
	TestAccount,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

const quote =
	'The problem with quotes on the Internet is that it is hard to verify their authenticity.\nby Abraham Lincoln';
const title = DataHelper.getRandomPhrase();
const category = 'Uncategorized';
const tag = 'test-tag';
const seoTitle = 'SEO example title';
const seoDescription = 'SEO example description';

test.describe(
	DataHelper.createSuiteTitle( 'Editor: Basic Post Flow' ),
	{ tag: [ tags.GUTENBERG, tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		const features = envToFeatureKey( envVariables );
		const accountName = getTestAccountByFeature( features, [
			{ gutenberg: 'stable', siteType: 'simple', accountName: 'simpleSitePersonalPlanUser' },
		] );

		test( 'As a user, I can create, publish, and view a post', async ( { page, pageEditor } ) => {
			let testAccount: TestAccount;
			let publishedPostPage: PublishedPostPage;
			let publishedURL: URL;

			await test.step( 'Given I am authenticated', async () => {
				testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
			} );

			await test.step( 'When I go to the new post page', async () => {
				await pageEditor.visit( 'post' );
			} );

			await test.step( 'When I enter post title', async () => {
				await pageEditor.enterTitle( title );
			} );

			await test.step( 'When I enter post content', async () => {
				const blockHandle = await pageEditor.addBlockFromSidebar(
					ParagraphBlock.blockName,
					ParagraphBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const paragraphBlock = new ParagraphBlock( blockHandle );
				await paragraphBlock.enterParagraph( quote, { type: true } );
			} );

			await test.step( 'When I add an "About" pattern', async () => {
				await pageEditor.addPatternFromSidebar( 'About', false );
			} );

			await test.step( 'When I open post settings', async () => {
				await pageEditor.openSettings( 'Settings' );
			} );

			await test.step( 'When I add post category', async () => {
				await pageEditor.selectCategory( category );
			} );

			await test.step( 'When I add post tag', async () => {
				await pageEditor.addTag( tag );
			} );

			await test.step( 'When I close settings', async () => {
				await pageEditor.closeSettings();
			} );

			// SEO fields only apply to Atomic sites
			if ( envVariables.TEST_ON_ATOMIC === true ) {
				await test.step( 'When I enter SEO title and description', async () => {
					await pageEditor.openSettings( 'Settings' );
					await pageEditor.enterSEODetails( { title: seoTitle, description: seoDescription } );
					await pageEditor.closeSettings();
				} );
			}

			await test.step( 'When I open Jetpack settings', async () => {
				await pageEditor.openSettings( 'Jetpack' );
			} );

			if ( envVariables.ATOMIC_VARIATION !== 'private' ) {
				await test.step( 'When I open link preview', async () => {
					const editorParent = await pageEditor.getEditorParent();
					const viewPreviewsButton = editorParent.getByRole( 'button', {
						name: 'View previews',
						exact: true,
					} );
					const linkPreviewPanelButton = editorParent.locator(
						'.components-panel__body-title button:has-text("Link preview")'
					);
					await viewPreviewsButton.or( linkPreviewPanelButton ).first().waitFor();

					if ( ( await viewPreviewsButton.count() ) > 0 ) {
						await viewPreviewsButton.first().click();
					} else {
						await pageEditor.expandSection( 'Link preview' );
						await pageEditor.clickSidebarButton( 'Open link preview' );
					}

					await editorParent.getByRole( 'dialog' ).getByRole( 'tab', { name: 'Tumblr' } ).waitFor();
				} );

				await test.step( 'When I show link preview for Tumblr', async () => {
					const editorParent = await pageEditor.getEditorParent();
					const dialog = editorParent.getByRole( 'dialog' );
					await dialog.getByRole( 'tab', { name: 'Tumblr' } ).click();
					await dialog.getByRole( 'tabpanel', { name: 'Tumblr' } ).waitFor();
					await dialog
						.filter( {
							hasText: new RegExp( `${ seoTitle }|${ title }` ),
						} )
						.waitFor();
				} );

				await test.step( 'When I dismiss link preview', async () => {
					await page.keyboard.press( 'Escape' );
				} );
			}

			await test.step( 'When I close settings', async () => {
				await pageEditor.closeSettings();
			} );

			await test.step( 'When I launch preview', async () => {
				if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
					const previewPage = await pageEditor.previewAsMobile();
					await previewPage.close();
				} else {
					await pageEditor.previewAsDesktop( 'Mobile' );
					await pageEditor.closePreview();
				}
			} );

			// Step skipped for mobile, since previewing naturally saves the post
			if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
				await test.step( 'When I save draft', async () => {
					await pageEditor.saveDraft();
				} );
			}

			await test.step( 'When I publish post', async () => {
				publishedURL = await pageEditor.publish();
			} );

			// Skip for Private sites, posts are not visible to non-logged out users
			if ( envVariables.ATOMIC_VARIATION !== 'private' ) {
				await test.step( 'Then I can view the published post', async () => {
					const newPage = await page.context().newPage();

					const trackingPixelLoaded = newPage.waitForResponse(
						new RegExp(
							`pixel.wp.com/g.gif.*blog=${ testAccount!.credentials.testSites?.primary
								.id }+.*&post=[\\d]+`
						)
					);
					await newPage.goto( publishedURL!.href );

					let response;
					try {
						response = await trackingPixelLoaded;
					} catch {
						// noop - will throw in next step
					}

					expect( publishedURL!.href ).toStrictEqual( newPage.url() );

					expect( response ).toBeDefined();
					expect( response!.status() ).toBe( 200 );

					publishedPostPage = new PublishedPostPage( newPage );
					await publishedPostPage.validateTitle( title );
					for ( const part of quote.split( '\n' ) ) {
						await publishedPostPage.validateTextInPost( part );
					}
					await publishedPostPage.validateCategory( category );
					await publishedPostPage.validateTags( tag );

					for ( const name of [ 'X', 'Facebook' ] ) {
						await publishedPostPage.validateSocialButton( name, { click: true } );
					}

					await newPage.close();
				} );
			}
		} );
	}
);
