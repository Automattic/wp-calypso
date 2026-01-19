import { EditorPage, PublishedPostPage, ParagraphBlock } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

const quote =
	'The problem with quotes on the Internet is that it is hard to verify their authenticity.\nby Abraham Lincoln';
const category = 'Uncategorized';
const tag = 'test-tag';
const seoTitle = 'SEO example title';
const seoDescription = 'SEO example description';

test.describe(
	'Editor: Basic Post Flow',
	{ tag: [ tags.GUTENBERG, tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		test( 'As a user, I can create, preview, and publish a post', async ( {
			browser,
			page,
			accountGivenByEnvironment,
			helperData,
			environment,
		} ) => {
			const title = helperData.getRandomPhrase();
			let editorPage: EditorPage;
			let publishedPostPage: PublishedPostPage;
			let publishedURL: URL;

			await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
				await accountGivenByEnvironment.authenticate( page );
			} );

			await test.step( 'When I go to the new post page', async function () {
				editorPage = new EditorPage( page );
				await editorPage.visit( 'post' );
			} );

			await test.step( 'And I enter post title', async function () {
				await editorPage.enterTitle( title );
			} );

			await test.step( 'And I enter post content', async function () {
				const blockHandle = await editorPage.addBlockFromSidebar(
					ParagraphBlock.blockName,
					ParagraphBlock.blockEditorSelector,
					{ noSearch: true }
				);
				const paragraphBlock = new ParagraphBlock( blockHandle );
				await paragraphBlock.enterParagraph( quote, { type: true } );
			} );

			await test.step( 'And I add a pattern', async function () {
				const patternName = 'About';
				await editorPage.addPatternFromSidebar( patternName, false );
			} );

			await test.step( 'And I open post settings', async function () {
				await editorPage.openSettings( 'Settings' );
			} );

			await test.step( 'And I add post category', async function () {
				await editorPage.selectCategory( category );
			} );

			await test.step( 'And I add post tag', async function () {
				await editorPage.addTag( tag );
			} );

			await test.step( 'And I close settings', async function () {
				await editorPage.closeSettings();
			} );

			await test.step( 'And I open Jetpack settings', async function () {
				// Works around the scenario where the Jetpack icon isn't pinned on the
				// editor toolbar.
				await editorPage.openEditorOptionsMenu();
				const editorParent = await editorPage.getEditorParent();
				await editorParent.getByRole( 'menuitemcheckbox', { name: 'Jetpack' } ).click();
			} );

			if ( environment.TEST_ON_ATOMIC === true ) {
				await test.step( 'And I enter SEO title and preview', async function () {
					await editorPage.enterSEODetails( {
						title: seoTitle,
						description: seoDescription,
					} );
				} );
			}

			if ( environment.ATOMIC_VARIATION !== 'private' ) {
				await test.step( 'And I open link preview', async function () {
					await editorPage.expandSection( 'Link preview' );
					await editorPage.clickSidebarButton( 'Open link preview' );
				} );

				await test.step( 'And I verify link preview for Tumblr', async function () {
					const editorParent = await editorPage.getEditorParent();
					const dialog = editorParent.getByRole( 'dialog' );

					await dialog.getByRole( 'tab', { name: 'Tumblr' } ).click();
					await dialog.getByRole( 'tabpanel', { name: 'Tumblr' } ).waitFor();
					await dialog
						.filter( {
							hasText: new RegExp( `${ seoTitle }|${ title }` ),
						} )
						.waitFor();
				} );

				await test.step( 'And I dismiss link preview', async function () {
					await page.keyboard.press( 'Escape' );
				} );
			}

			await test.step( 'And I close settings', async function () {
				await editorPage.closeSettings();
			} );

			await test.step( 'And I launch preview', async function () {
				let previewPage: ReturnType< typeof page.constructor.prototype.newPage > | undefined;

				if ( environment.VIEWPORT_NAME === 'mobile' ) {
					previewPage = await editorPage.previewAsMobile();
				} else {
					await editorPage.previewAsDesktop( 'Mobile' );
				}

				if ( previewPage ) {
					await previewPage.close();
				} else {
					await editorPage.closePreview();
				}
			} );

			if ( environment.VIEWPORT_NAME !== 'mobile' ) {
				await test.step( 'And I save draft', async function () {
					await editorPage.saveDraft();
				} );
			}

			await test.step( 'And I publish post', async function () {
				publishedURL = await editorPage.publish();
			} );

			if ( environment.ATOMIC_VARIATION !== 'private' ) {
				await test.step( 'Then I can view the published post', async function () {
					const newPage = await browser.newPage();
					const trackingPixelLoaded = newPage.waitForResponse(
						new RegExp(
							`pixel.wp.com/g.gif.*blog=${ accountGivenByEnvironment.credentials.testSites?.primary.id }+.*&post=[\\d]+`
						)
					);
					await newPage.goto( publishedURL.href );

					let response: Awaited< ReturnType< typeof trackingPixelLoaded > > | undefined;
					try {
						response = await trackingPixelLoaded;
					} catch {
						// noop - will check in next step.
					}

					expect( publishedURL.href ).toStrictEqual( newPage.url() );

					await test.step( 'And Jetpack Stats tracking pixel is loaded', async function () {
						expect( response ).toBeDefined();
						expect( response?.status() ).toBe( 200 );
					} );

					await test.step( 'And post content is found in published post', async function () {
						publishedPostPage = new PublishedPostPage( newPage );
						await publishedPostPage.validateTitle( title );
						for ( const part of quote.split( '\n' ) ) {
							await publishedPostPage.validateTextInPost( part );
						}
					} );

					await test.step( 'And post metadata is found in published post', async function () {
						await publishedPostPage.validateCategory( category );
						await publishedPostPage.validateTags( tag );
					} );

					for ( const socialNetwork of [ 'X', 'Facebook' ] ) {
						await test.step( `And social sharing button for ${ socialNetwork } can be clicked`, async function () {
							publishedPostPage = new PublishedPostPage( newPage );
							await publishedPostPage.validateSocialButton( socialNetwork, { click: true } );
						} );
					}

					await newPage.close();
				} );
			}
		} );
	}
);
