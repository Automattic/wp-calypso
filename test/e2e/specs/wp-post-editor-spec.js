/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';

import EditorPage from '../lib/pages/editor-page.js';
import TwitterFeedPage from '../lib/pages/twitter-feed-page.js';
import ViewPostPage from '../lib/pages/view-post-page.js';
import NotFoundPage from '../lib/pages/not-found-page.js';
import PostsPage from '../lib/pages/posts-page.js';
import ReaderPage from '../lib/pages/reader-page';
import ActivityPage from '../lib/pages/stats/activity-page';
import PaypalCheckoutPage from '../lib/pages/external/paypal-checkout-page';

import SidebarComponent from '../lib/components/sidebar-component.js';
import NavBarComponent from '../lib/components/nav-bar-component.js';
import NoticesComponent from '../lib/components/notices-component.js';
import PostPreviewComponent from '../lib/components/post-preview-component.js';
import PostEditorSidebarComponent from '../lib/components/post-editor-sidebar-component.js';
import PostEditorToolbarComponent from '../lib/components/post-editor-toolbar-component';
import EditorConfirmationSidebarComponent from '../lib/components/editor-confirmation-sidebar-component';

import * as driverManager from '../lib/driver-manager';
import * as driverHelper from '../lib/driver-helper';
import * as mediaHelper from '../lib/media-helper';
import * as dataHelper from '../lib/data-helper';
import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Editor: Posts (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Public Posts: Preview and Publish a Public Post @parallel @jetpack', function () {
		let fileDetails;
		const blogPostTitle = dataHelper.randomPhrase();
		const blogPostQuote =
			'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';
		const newTagName = 'Tag ' + new Date().getTime().toString();
		const publicizeMessage = dataHelper.randomPhrase();

		// Create image file for upload
		before( async function () {
			fileDetails = await mediaHelper.createFile();
			return fileDetails;
		} );

		step( 'Can log in', async function () {
			const loginFlow = new LoginFlow( driver );
			return await loginFlow.loginAndStartNewPost();
		} );

		step( 'Can enter post title, content and image', async function () {
			const editorPage = await EditorPage.Expect( driver );
			await editorPage.enterTitle( blogPostTitle );
			await editorPage.enterContent( blogPostQuote + '\n' );
			await editorPage.enterPostImage( fileDetails );
			await editorPage.waitUntilImageInserted( fileDetails );
			const errorShown = await editorPage.isErrorDisplayed();
			assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );
		} );

		step( 'Expand Categories and Tags', async function () {
			const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
			await postEditorSidebarComponent.expandCategoriesAndTags();
		} );

		step( 'Can add a new tag', async function () {
			const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
			await postEditorSidebarComponent.addNewTag( newTagName );
		} );

		step( 'Close categories and tags', async function () {
			const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
			await postEditorSidebarComponent.closeCategoriesAndTags();
		} );

		step( 'Verify tags present after save', async function () {
			const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
			const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
			await postEditorSidebarComponent.hideComponentIfNecessary();
			await postEditorToolbarComponent.ensureSaved();
			await postEditorSidebarComponent.displayComponentIfNecessary();
			const subtitle = await postEditorSidebarComponent.getCategoriesAndTags();
			assert( subtitle.match( `#${ newTagName }` ), `New tag #${ newTagName } not applied` );
		} );

		step( 'Expand sharing section', async function () {
			const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
			await postEditorSidebarComponent.expandSharingSection();
		} );

		if ( host !== 'CI' && host !== 'JN' ) {
			step( 'Can see the publicise to twitter account', async function () {
				const publicizeTwitterAccount = config.has( 'publicizeTwitterAccount' )
					? config.get( 'publicizeTwitterAccount' )
					: '';
				const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
				const accountDisplayed = await postEditorSidebarComponent.publicizeToTwitterAccountDisplayed();
				assert.strictEqual(
					accountDisplayed,
					publicizeTwitterAccount,
					'Could not see see the publicize to twitter account ' +
						publicizeTwitterAccount +
						' in the editor'
				);
			} );

			step( 'Can see the default publicise message', async function () {
				const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
				const messageDisplayed = await postEditorSidebarComponent.publicizeMessageDisplayed();
				assert.strictEqual(
					messageDisplayed,
					blogPostTitle,
					"The publicize message is not defaulting to the post's title"
				);
			} );

			step( 'Can set a custom publicise message', async function () {
				const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
				await postEditorSidebarComponent.setPublicizeMessage( publicizeMessage );
			} );
		}

		step( 'Close sharing section', async function () {
			const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
			await postEditorSidebarComponent.closeSharingSection();
		} );

		step( 'Can launch post preview', async function () {
			const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
			await postEditorSidebarComponent.hideComponentIfNecessary();

			this.postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
			await this.postEditorToolbarComponent.ensureSaved();
			await this.postEditorToolbarComponent.launchPreview();
			this.postPreviewComponent = await PostPreviewComponent.Expect( driver );
			return await this.postPreviewComponent.displayed();
		} );

		step( 'Can see correct post title in preview', async function () {
			const postTitle = await this.postPreviewComponent.postTitle();
			assert.strictEqual(
				postTitle.toLowerCase(),
				blogPostTitle.toLowerCase(),
				'The blog post preview title is not correct'
			);
		} );

		step( 'Can see correct post content in preview', async function () {
			const content = await this.postPreviewComponent.postContent();
			assert.strictEqual(
				content.indexOf( blogPostQuote ) > -1,
				true,
				'The post preview content (' +
					content +
					') does not include the expected content (' +
					blogPostQuote +
					')'
			);
		} );

		step( 'Can see the post tag in preview', async function () {
			const tagDisplayed = await this.postPreviewComponent.tagDisplayed();
			assert.strictEqual(
				tagDisplayed.toUpperCase(),
				newTagName.toUpperCase(),
				'The tag: ' + newTagName + ' is not being displayed on the post'
			);
		} );

		step( 'Can see the image in preview', async function () {
			const imageDisplayed = await this.postPreviewComponent.imageDisplayed( fileDetails );
			assert.strictEqual( imageDisplayed, true, 'Could not see the image in the web preview' );
		} );

		step( 'Can close post preview', async function () {
			await this.postPreviewComponent.close();
		} );

		step( 'Can publish and view content', async function () {
			const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
			await postEditorToolbarComponent.publishThePost( { useConfirmStep: true } );
		} );

		step( 'Can see correct post title in preview', async function () {
			this.postPreviewComponent = await PostPreviewComponent.Expect( driver );
			const postTitle = await this.postPreviewComponent.postTitle();
			assert.strictEqual(
				postTitle.toLowerCase(),
				blogPostTitle.toLowerCase(),
				'The blog post preview title is not correct'
			);
		} );

		step( 'Can see correct post content in preview', async function () {
			const content = await this.postPreviewComponent.postContent();
			assert.strictEqual(
				content.indexOf( blogPostQuote ) > -1,
				true,
				'The post preview content (' +
					content +
					') does not include the expected content (' +
					blogPostQuote +
					')'
			);
		} );

		step( 'Can see the post tag in preview', async function () {
			const tagDisplayed = await this.postPreviewComponent.tagDisplayed();
			assert.strictEqual(
				tagDisplayed.toUpperCase(),
				newTagName.toUpperCase(),
				'The tag: ' + newTagName + ' is not being displayed on the post'
			);
		} );

		step( 'Can see the image in preview', async function () {
			const imageDisplayed = await this.postPreviewComponent.imageDisplayed( fileDetails );
			assert.strictEqual( imageDisplayed, true, 'Could not see the image in the web preview' );
		} );

		step( 'Can close post preview', async function () {
			return await this.postPreviewComponent.edit();
		} );

		step( 'Can publish and view content', async function () {
			const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
			await postEditorToolbarComponent.viewPublishedPostOrPage();
		} );

		step( 'Can see correct post title', async function () {
			this.viewPostPage = await ViewPostPage.Expect( driver );
			const postTitle = await this.viewPostPage.postTitle();
			assert.strictEqual(
				postTitle.toLowerCase(),
				blogPostTitle.toLowerCase(),
				'The published blog post title is not correct'
			);
		} );

		step( 'Can see correct post content', async function () {
			const content = await this.viewPostPage.postContent();
			assert.strictEqual(
				content.indexOf( blogPostQuote ) > -1,
				true,
				'The post content (' +
					content +
					') does not include the expected content (' +
					blogPostQuote +
					')'
			);
		} );

		step( 'Can see correct post tag', async function () {
			const tagDisplayed = await this.viewPostPage.tagDisplayed();
			assert.strictEqual(
				tagDisplayed.toUpperCase(),
				newTagName.toUpperCase(),
				'The tag: ' + newTagName + ' is not being displayed on the post'
			);
		} );

		step( 'Can see the image published', async function () {
			const imageDisplayed = await this.viewPostPage.imageDisplayed( fileDetails );
			assert.strictEqual( imageDisplayed, true, 'Could not see the image in the published post' );
		} );

		if ( host !== 'CI' && host !== 'JN' ) {
			describe( 'Can see post publicized on twitter', function () {
				step( 'Can see post message', async function () {
					const twitterFeedPage = await TwitterFeedPage.Visit( driver );
					return await twitterFeedPage.checkLatestTweetsContain( publicizeMessage );
				} );
			} );
		}

		after( async function () {
			if ( fileDetails ) {
				await mediaHelper.deleteFile( fileDetails );
			}
		} );
	} );

	describe( 'Basic Public Post @parallel @jetpack @canary', function () {
		describe( 'Publish a New Post', function () {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'“Whenever you find yourself on the side of the majority, it is time to pause and reflect.”\n- Mark Twain';

			step( 'Can log in', async function () {
				this.loginFlow = new LoginFlow( driver );
				return await this.loginFlow.loginAndStartNewPost( null, false, { useFreshLogin: true } );
			} );

			step( 'Can enter post title and content', async function () {
				this.editorPage = await EditorPage.Expect( driver );
				await this.editorPage.enterTitle( blogPostTitle );
				await this.editorPage.enterContent( blogPostQuote + '\n' );

				const errorShown = await this.editorPage.isErrorDisplayed();
				return assert.strictEqual(
					errorShown,
					false,
					'There is an error shown on the editor page!'
				);
			} );

			step( 'Can publish and view content', async function () {
				const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
				await postEditorToolbarComponent.ensureSaved();
				return await postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: true } );
			} );

			step( 'Can see correct post title', async function () {
				this.viewPostPage = await ViewPostPage.Expect( driver );
				const postTitle = await this.viewPostPage.postTitle();
				assert.strictEqual(
					postTitle.toLowerCase(),
					blogPostTitle.toLowerCase(),
					'The published blog post title is not correct'
				);
			} );
		} );
	} );

	describe( 'Check Activity Log for Public Post @jetpack @parallel', function () {
		const blogPostTitle = dataHelper.randomPhrase();
		const blogPostQuote =
			'“We are what we pretend to be, so we must be careful about what we pretend to be.”\n- Kurt Vonnegut';

		step( 'Can log in', async function () {
			const loginFlow = new LoginFlow( driver );
			return await loginFlow.loginAndStartNewPost();
		} );

		step( 'Can enter post title and content', async function () {
			const editorPage = await EditorPage.Expect( driver );
			await editorPage.enterTitle( blogPostTitle );
			await editorPage.enterContent( blogPostQuote + '\n' );

			const errorShown = await editorPage.isErrorDisplayed();
			return assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );
		} );

		step( 'Can publish and view content', async function () {
			const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
			await postEditorToolbarComponent.ensureSaved();
			await postEditorToolbarComponent.publishThePost( { useConfirmStep: true } );
			return await postEditorToolbarComponent.waitForSuccessViewPostNotice();
		} );

		step( 'Can see the post in the Activity log', async function () {
			await ReaderPage.Visit( driver );
			const navBarComponent = await NavBarComponent.Expect( driver );
			await navBarComponent.clickMySites();
			const sidebarComponent = await SidebarComponent.Expect( driver );
			await sidebarComponent.ensureSidebarMenuVisible();

			if ( host !== 'WPCOM' ) {
				await sidebarComponent.selectSite( dataHelper.getJetpackSiteName() );
			}

			await sidebarComponent.selectActivity();
			const activityPage = await ActivityPage.Expect( driver );
			const displayed = await activityPage.postTitleDisplayed( blogPostTitle );
			return assert(
				displayed,
				`The published post title '${ blogPostTitle }' was not displayed in activity log after publishing`
			);
		} );
	} );

	describe( 'Schedule Basic Public Post @parallel @jetpack', function () {
		let publishDate;

		describe( 'Schedule (and remove) a New Post', function () {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote = '“Worries shared are worries halved.”\n- Unknown';

			step( 'Can log in', async function () {
				this.loginFlow = new LoginFlow( driver );
				return await this.loginFlow.loginAndStartNewPost();
			} );

			step( 'Can enter post title and content', async function () {
				this.editorPage = await EditorPage.Expect( driver );
				await this.editorPage.enterTitle( blogPostTitle );
				await this.editorPage.enterContent( blogPostQuote + '\n' );

				const errorShown = await this.editorPage.isErrorDisplayed();
				return assert.strictEqual(
					errorShown,
					false,
					'There is an error shown on the editor page!'
				);
			} );

			step(
				'Can schedule content for a future date (first day of second week next month)',
				async function () {
					let postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
					await postEditorToolbarComponent.ensureSaved( { clickSave: true } );
					const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
					await postEditorSidebarComponent.expandStatusSection();
					await postEditorSidebarComponent.chooseFutureDate();
					publishDate = await postEditorSidebarComponent.getSelectedPublishDate();
					await postEditorSidebarComponent.closeStatusSection();
					const editorPage = await EditorPage.Expect( driver );
					await editorPage.waitForPage();
					postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
					await postEditorToolbarComponent.ensureSaved( { clickSave: true } );
					return await postEditorToolbarComponent.clickPublishPost();
				}
			);

			step( 'Can confirm scheduling post and see correct publish date', async function () {
				const editorConfirmationSidebarComponent = await EditorConfirmationSidebarComponent.Expect(
					driver
				);
				const publishDateShown = await editorConfirmationSidebarComponent.publishDateShown();
				assert.strictEqual(
					publishDateShown,
					publishDate,
					'The publish date shown is not the expected publish date'
				);
				await editorConfirmationSidebarComponent.confirmAndPublish();
				const noticesComponent = await NoticesComponent.Expect( driver );
				await noticesComponent.isSuccessNoticeDisplayed();
				const postEditorPage = await EditorPage.Expect( driver );
				return assert(
					await postEditorPage.postIsScheduled(),
					'The newly scheduled post is not showing in the editor as scheduled'
				);
			} );

			step( 'Remove scheduled post', async function () {
				const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
				return await postEditorSidebarComponent.trashPost();
			} );
		} );
	} );

	describe( 'Private Posts: @parallel @jetpack', function () {
		describe( 'Publish a Private Post', function () {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'If you’re not prepared to be wrong; you’ll never come up with anything original.\n— Sir Ken Robinson\n';

			step( 'Can log in', async function () {
				const loginFlow = new LoginFlow( driver );
				await loginFlow.loginAndStartNewPost();
			} );

			step( 'Can enter post title and content', async function () {
				const editorPage = await EditorPage.Expect( driver );
				await editorPage.enterTitle( blogPostTitle );
				await editorPage.enterContent( blogPostQuote );
			} );

			step( 'Can disable sharing buttons', async function () {
				const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
				await postEditorSidebarComponent.expandSharingSection();
				await postEditorSidebarComponent.setSharingButtons( false );
				await postEditorSidebarComponent.closeSharingSection();
			} );

			step( 'Can allow comments', async function () {
				const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
				await postEditorSidebarComponent.expandMoreOptions();
				await postEditorSidebarComponent.setCommentsForPost( true );
			} );

			describe( 'Set to private which publishes it', function () {
				step( 'Ensure the post is saved', async function () {
					await EditorPage.Expect( driver );
					const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
					await postEditorToolbarComponent.ensureSaved();
				} );

				step( 'Can set visibility to private which immediately publishes it', async function () {
					const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
					await postEditorSidebarComponent.setVisibilityToPrivate();
					this.postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
					await this.postEditorToolbarComponent.waitForSuccessViewPostNotice();
					await this.postEditorToolbarComponent.viewPublishedPostOrPage();
				} );

				if ( host === 'WPCOM' ) {
					describe( 'As a logged in user ', function () {
						step( 'Can see correct post title', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const postTitle = await viewPostPage.postTitle();
							assert.strictEqual(
								postTitle.toLowerCase(),
								'private: ' + blogPostTitle.toLowerCase(),
								'The published blog post title is not correct'
							);
						} );

						step( 'Can see correct post content', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const content = await viewPostPage.postContent();
							assert.strictEqual(
								content.indexOf( blogPostQuote ) > -1,
								true,
								'The post content (' +
									content +
									') does not include the expected content (' +
									blogPostQuote +
									')'
							);
						} );

						step( 'Can see comments enabled', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const visible = await viewPostPage.commentsVisible();
							assert.strictEqual(
								visible,
								true,
								'Comments are not shown even though they were enabled when creating the post.'
							);
						} );

						step( "Can't see sharing buttons", async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const visible = await viewPostPage.sharingButtonsVisible();
							assert.strictEqual(
								visible,
								false,
								'Sharing buttons are shown even though they were disabled when creating the post.'
							);
						} );

						describe( 'As a non-logged in user ', function () {
							before( async function () {
								await driverManager.clearCookiesAndDeleteLocalStorage( driver );
								await driver.navigate().refresh();
							} );

							step( "Can't see post at all", async function () {
								const notFoundPage = await NotFoundPage.Expect( driver );
								const displayed = await notFoundPage.displayed();
								assert.strictEqual(
									displayed,
									true,
									'Could not see the not found (404) page. Check that it is displayed'
								);
							} );
						} );
					} );
				} else {
					// Jetpack tests
					describe( 'As a non-logged in user ', function () {
						step( "Can't see post at all", async function () {
							const notFoundPage = await NotFoundPage.Expect( driver );
							const displayed = await notFoundPage.displayed();
							assert.strictEqual(
								displayed,
								true,
								'Could not see the not found (404) page. Check that it is displayed'
							);
						} );
					} );
					//TODO: Log in via SSO and verify content
				}
			} );
		} );
	} );

	describe( 'Password Protected Posts: @parallel @jetpack', function () {
		describe( 'Publish a Password Protected Post', function () {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'The best thing about the future is that it comes only one day at a time.\n— Abraham Lincoln\n';
			const postPassword = 'e2e' + new Date().getTime().toString();

			step( 'Can log in', async function () {
				const loginFlow = new LoginFlow( driver );
				await loginFlow.loginAndStartNewPost();
			} );

			step( 'Can enter post title and content and set to password protected', async function () {
				this.editorPage = await EditorPage.Expect( driver );
				await this.editorPage.enterTitle( blogPostTitle );
				this.postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
				await this.postEditorSidebarComponent.setVisibilityToPasswordProtected( postPassword );
				this.editorPage = await EditorPage.Expect( driver );
				await this.editorPage.enterContent( blogPostQuote );
				this.postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
				await this.postEditorToolbarComponent.ensureSaved();
			} );

			step( 'Can enable sharing buttons', async function () {
				const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
				await postEditorSidebarComponent.expandSharingSection();
				await postEditorSidebarComponent.setSharingButtons( true );
				await postEditorSidebarComponent.closeSharingSection();
			} );

			step( 'Can disallow comments', async function () {
				const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
				await postEditorSidebarComponent.expandMoreOptions();
				await postEditorSidebarComponent.setCommentsForPost( false );
				await postEditorSidebarComponent.closeMoreOptions();
			} );

			describe( 'Publish and View', function () {
				// Can publish and view content
				before( async function () {
					const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
					await postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: true } );
				} );

				describe( 'As a logged in user', function () {
					describe( 'With no password entered', function () {
						step( 'Can view post title', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const postTitle = await viewPostPage.postTitle();
							assert.strictEqual(
								postTitle.toLowerCase(),
								( 'Protected: ' + blogPostTitle ).toLowerCase()
							);
						} );

						step( 'Can see password field', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const isPasswordProtected = await viewPostPage.isPasswordProtected();
							assert.strictEqual(
								isPasswordProtected,
								true,
								'The blog post does not appear to be password protected'
							);
						} );

						step( "Can't see content when no password is entered", async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const content = await viewPostPage.postContent();
							assert.strictEqual(
								content.indexOf( blogPostQuote ) === -1,
								true,
								'The post content (' +
									content +
									') displays the expected content (' +
									blogPostQuote +
									') when it should be password protected.'
							);
						} );

						step( "Can't see comments", async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const visible = await viewPostPage.commentsVisible();
							assert.strictEqual(
								visible,
								false,
								'Comments are shown even though they were disabled when creating the post.'
							);
						} );

						step( 'Can see sharing buttons', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const visible = await viewPostPage.sharingButtonsVisible();
							return assert.strictEqual(
								visible,
								true,
								'Sharing buttons are not shown even though they were enabled when creating the post.'
							);
						} );
					} );

					describe( 'With incorrect password entered', function () {
						// Enter incorrect password
						before( async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							await viewPostPage.displayed();
							await viewPostPage.enterPassword( 'password' );
						} );

						step( 'Can view post title', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const postTitle = await viewPostPage.postTitle();
							assert.strictEqual(
								postTitle.toLowerCase(),
								( 'Protected: ' + blogPostTitle ).toLowerCase()
							);
						} );

						step( 'Can see password field', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const isPasswordProtected = await viewPostPage.isPasswordProtected();
							assert.strictEqual(
								isPasswordProtected,
								true,
								'The blog post does not appear to be password protected'
							);
						} );

						step( "Can't see content when incorrect password is entered", async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const content = await viewPostPage.postContent();
							assert.strictEqual(
								content.indexOf( blogPostQuote ) === -1,
								true,
								'The post content (' +
									content +
									') displays the expected content (' +
									blogPostQuote +
									') when it should be password protected.'
							);
						} );

						step( "Can't see comments", async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const visible = await viewPostPage.commentsVisible();
							assert.strictEqual(
								visible,
								false,
								'Comments are shown even though they were disabled when creating the post.'
							);
						} );

						step( 'Can see sharing buttons', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const visible = await viewPostPage.sharingButtonsVisible();
							assert.strictEqual(
								visible,
								true,
								'Sharing buttons are not shown even though they were enabled when creating the post.'
							);
						} );
					} );

					describe( 'With correct password entered', function () {
						// Enter correct password
						before( async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							await viewPostPage.displayed();
							await viewPostPage.enterPassword( postPassword );
						} );

						step( 'Can view post title', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const postTitle = await viewPostPage.postTitle();
							assert.strictEqual(
								postTitle.toLowerCase(),
								( 'Protected: ' + blogPostTitle ).toLowerCase()
							);
						} );

						step( "Can't see password field", async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const isPasswordProtected = await viewPostPage.isPasswordProtected();
							assert.strictEqual(
								isPasswordProtected,
								false,
								'The blog post still appears to be password protected'
							);
						} );

						step( 'Can see page content', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const content = await viewPostPage.postContent();
							assert.strictEqual(
								content.indexOf( blogPostQuote ) > -1,
								true,
								'The post content (' +
									content +
									') does not include the expected content (' +
									blogPostQuote +
									')'
							);
						} );

						step( "Can't see comments", async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const visible = await viewPostPage.commentsVisible();
							assert.strictEqual(
								visible,
								false,
								'Comments are shown even though they were disabled when creating the post.'
							);
						} );

						step( 'Can see sharing buttons', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const visible = await viewPostPage.sharingButtonsVisible();
							assert.strictEqual(
								visible,
								true,
								'Sharing buttons are not shown even though they were enabled when creating the post.'
							);
						} );
					} );
				} );
				describe( 'As a non-logged in user', function () {
					before( async function () {
						await driverManager.clearCookiesAndDeleteLocalStorage( driver );
						await driver.navigate().refresh();
					} );
					describe( 'With no password entered', function () {
						step( 'Can view post title', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const postTitle = await viewPostPage.postTitle();
							assert.strictEqual(
								postTitle.toLowerCase(),
								( 'Protected: ' + blogPostTitle ).toLowerCase()
							);
						} );

						step( 'Can see password field', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const isPasswordProtected = await viewPostPage.isPasswordProtected();
							assert.strictEqual(
								isPasswordProtected,
								true,
								'The blog post does not appear to be password protected'
							);
						} );

						step( "Can't see content when no password is entered", async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const content = await viewPostPage.postContent();
							assert.strictEqual(
								content.indexOf( blogPostQuote ) === -1,
								true,
								'The post content (' +
									content +
									') displays the expected content (' +
									blogPostQuote +
									') when it should be password protected.'
							);
						} );

						step( "Can't see comments", async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const visible = await viewPostPage.commentsVisible();
							assert.strictEqual(
								visible,
								false,
								'Comments are shown even though they were disabled when creating the post.'
							);
						} );

						step( 'Can see sharing buttons', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const visible = await viewPostPage.sharingButtonsVisible();
							return assert.strictEqual(
								visible,
								true,
								'Sharing buttons are not shown even though they were enabled when creating the post.'
							);
						} );
					} );

					describe( 'With incorrect password entered', function () {
						// Enter incorrect password
						before( async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							await viewPostPage.displayed();
							await viewPostPage.enterPassword( 'password' );
						} );

						step( 'Can view post title', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const postTitle = await viewPostPage.postTitle();
							assert.strictEqual(
								postTitle.toLowerCase(),
								( 'Protected: ' + blogPostTitle ).toLowerCase()
							);
						} );

						step( 'Can see password field', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const isPasswordProtected = await viewPostPage.isPasswordProtected();
							assert.strictEqual(
								isPasswordProtected,
								true,
								'The blog post does not appear to be password protected'
							);
						} );

						step( "Can't see content when incorrect password is entered", async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const content = await viewPostPage.postContent();
							assert.strictEqual(
								content.indexOf( blogPostQuote ) === -1,
								true,
								'The post content (' +
									content +
									') displays the expected content (' +
									blogPostQuote +
									') when it should be password protected.'
							);
						} );

						step( "Can't see comments", async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const visible = await viewPostPage.commentsVisible();
							assert.strictEqual(
								visible,
								false,
								'Comments are shown even though they were disabled when creating the post.'
							);
						} );

						step( 'Can see sharing buttons', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const visible = await viewPostPage.sharingButtonsVisible();
							assert.strictEqual(
								visible,
								true,
								'Sharing buttons are not shown even though they were enabled when creating the post.'
							);
						} );
					} );

					describe( 'With correct password entered', function () {
						// Enter correct password
						before( async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							await viewPostPage.displayed();
							await viewPostPage.enterPassword( postPassword );
						} );

						step( 'Can view post title', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const postTitle = await viewPostPage.postTitle();
							assert.strictEqual(
								postTitle.toLowerCase(),
								( 'Protected: ' + blogPostTitle ).toLowerCase()
							);
						} );

						step( "Can't see password field", async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const isPasswordProtected = await viewPostPage.isPasswordProtected();
							assert.strictEqual(
								isPasswordProtected,
								false,
								'The blog post still appears to be password protected'
							);
						} );

						step( 'Can see page content', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const content = await viewPostPage.postContent();
							assert.strictEqual(
								content.indexOf( blogPostQuote ) > -1,
								true,
								'The post content (' +
									content +
									') does not include the expected content (' +
									blogPostQuote +
									')'
							);
						} );

						step( "Can't see comments", async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const visible = await viewPostPage.commentsVisible();
							assert.strictEqual(
								visible,
								false,
								'Comments are shown even though they were disabled when creating the post.'
							);
						} );

						step( 'Can see sharing buttons', async function () {
							const viewPostPage = await ViewPostPage.Expect( driver );
							const visible = await viewPostPage.sharingButtonsVisible();
							assert.strictEqual(
								visible,
								true,
								'Sharing buttons are not shown even though they were enabled when creating the post.'
							);
						} );
					} );
				} );
			} );
		} );
	} );

	describe( 'Trash Post: @parallel @jetpack', function () {
		describe( 'Trash a New Post', function () {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'The only victory that counts is the victory over yourself.\n— Jesse Owens\n';

			step( 'Can log in', async function () {
				const loginFlow = new LoginFlow( driver );
				return await loginFlow.loginAndStartNewPost();
			} );

			step( 'Can enter post title and content', async function () {
				const editorPage = await EditorPage.Expect( driver );
				await editorPage.enterTitle( blogPostTitle );
				return await editorPage.enterContent( blogPostQuote );
			} );

			step( 'Can trash the new post', async function () {
				const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
				return await postEditorSidebarComponent.trashPost();
			} );

			step( 'Can then see the Posts page with a confirmation message', async function () {
				const noticesComponent = await NoticesComponent.Expect( driver );
				const displayed = await noticesComponent.isSuccessNoticeDisplayed();
				return assert.strictEqual(
					displayed,
					true,
					'The Posts page success notice for deleting the post is not displayed'
				);
			} );
		} );
	} );

	describe( 'Edit a Post: @parallel @jetpack', function () {
		describe( 'Publish a New Post', function () {
			const originalBlogPostTitle = dataHelper.randomPhrase();
			const updatedBlogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'Science is organised knowledge. Wisdom is organised life..\n~ Immanuel Kant\n';

			if ( host !== 'WPCOM' ) {
				step( 'Can log into Jetpack site', async function () {
					const account = dataHelper.getAccountConfig();
					const loginPage = await WPAdminLogonPage.Visit( driver, dataHelper.getJetpackSiteName() );
					await loginPage.login( account[ 0 ], account[ 1 ] );
					await WPAdminSidebar.Expect( driver );
				} );
			}

			step( 'Can log in', async function () {
				this.loginFlow = new LoginFlow( driver );
				return await this.loginFlow.loginAndStartNewPost();
			} );

			step( 'Can enter post title and content', async function () {
				this.editorPage = await EditorPage.Expect( driver );
				await this.editorPage.enterTitle( originalBlogPostTitle );
				await this.editorPage.enterContent( blogPostQuote );
				const errorShown = await this.editorPage.isErrorDisplayed();
				return assert.strictEqual(
					errorShown,
					false,
					'There is an error shown on the editor page!'
				);
			} );

			step( 'Can publish the post', async function () {
				this.postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
				await this.postEditorToolbarComponent.ensureSaved();
				await this.postEditorToolbarComponent.publishThePost( { useConfirmStep: true } );
				return await this.postEditorToolbarComponent.waitForSuccessViewPostNotice();
			} );

			describe( 'Edit the post via posts', function () {
				step( 'Can view the posts list', async function () {
					this.readerPage = await ReaderPage.Visit( driver );
					this.navbarComponent = await NavBarComponent.Expect( driver );
					await this.navbarComponent.clickMySites();
					const jetpackSiteName = dataHelper.getJetpackSiteName();
					this.sidebarComponent = await SidebarComponent.Expect( driver );
					if ( host !== 'WPCOM' ) {
						await this.sidebarComponent.selectSite( jetpackSiteName );
					}
					await this.sidebarComponent.selectPosts();
					return ( this.postsPage = await PostsPage.Expect( driver ) );
				} );

				step( 'Can see and edit our new post', async function () {
					await this.postsPage.waitForPostTitled( originalBlogPostTitle );
					const displayed = await this.postsPage.isPostDisplayed( originalBlogPostTitle );
					assert.strictEqual(
						displayed,
						true,
						`The blog post titled '${ originalBlogPostTitle }' is not displayed in the list of posts`
					);
					await this.postsPage.editPostWithTitle( originalBlogPostTitle );
					return ( this.editorPage = await EditorPage.Expect( driver ) );
				} );

				step( 'Can see the post title', async function () {
					await this.editorPage.waitForTitle();
					const titleShown = await this.editorPage.titleShown();
					assert.strictEqual(
						titleShown,
						originalBlogPostTitle,
						'The blog post title shown was unexpected'
					);
				} );

				step(
					'Can set the new title and update it, and link to the updated post',
					async function () {
						await this.editorPage.enterTitle( updatedBlogPostTitle );
						const errorShown = await this.editorPage.isErrorDisplayed();
						assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );
						this.postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
						await this.postEditorToolbarComponent.publishThePost();
						return await this.postEditorToolbarComponent.waitForSuccessAndViewPost();
					}
				);

				describe( 'Can view the post with the new title', function () {
					step( 'Can view the post', async function () {
						return ( this.viewPostPage = await ViewPostPage.Expect( driver ) );
					} );

					step( 'Can see correct post title', async function () {
						const postTitle = await this.viewPostPage.postTitle();
						return assert.strictEqual(
							postTitle.toLowerCase(),
							updatedBlogPostTitle.toLowerCase(),
							'The published blog post title is not correct'
						);
					} );
				} );
			} );
		} );
	} );

	describe( 'Insert a contact form: @parallel @jetpack', function () {
		describe( 'Publish a New Post with a Contact Form', function () {
			const originalBlogPostTitle = 'Contact Us: ' + dataHelper.randomPhrase();

			step( 'Can log in', async function () {
				this.loginFlow = new LoginFlow( driver );
				return await this.loginFlow.loginAndStartNewPost();
			} );

			step( 'Can insert the contact form', async function () {
				this.editorPage = await EditorPage.Expect( driver );
				await this.editorPage.enterTitle( originalBlogPostTitle );
				await this.editorPage.insertContactForm();

				const errorShown = await this.editorPage.isErrorDisplayed();
				return assert.strictEqual(
					errorShown,
					false,
					'There is an error shown on the editor page!'
				);
			} );

			step( 'Can see the contact form inserted into the visual editor', async function () {
				this.editorPage = await EditorPage.Expect( driver );
				return await this.editorPage.ensureContactFormDisplayedInPost();
			} );

			step( 'Can publish and view content', async function () {
				const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
				await postEditorToolbarComponent.ensureSaved();
				await postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: true } );
			} );

			step( 'Can see the contact form in our published post', async function () {
				this.viewPostPage = await ViewPostPage.Expect( driver );
				const displayed = await this.viewPostPage.contactFormDisplayed();
				assert.strictEqual(
					displayed,
					true,
					'The published post does not contain the contact form'
				);
			} );
		} );
	} );

	describe( 'Insert a payment button: @parallel @jetpack', function () {
		const paymentButtonDetails = {
			title: 'Button',
			description: 'Description',
			symbol: '$',
			price: '1.99',
			currency: 'USD',
			allowQuantity: true,
			email: 'test@wordpress.com',
		};

		step( 'Can log in', async function () {
			if ( host === 'WPCOM' ) {
				return await new LoginFlow( driver ).loginAndStartNewPost();
			}
			const jetpackUrl = `jetpackpro${ host.toLowerCase() }.mystagingwebsite.com`;
			await new LoginFlow( driver, 'jetpackUserPREMIUM' ).loginAndStartNewPost( jetpackUrl );
		} );

		step( 'Can insert the payment button', async function () {
			const blogPostTitle = 'Payment Button: ' + dataHelper.randomPhrase();

			const editorPage = await EditorPage.Expect( driver );
			await editorPage.enterTitle( blogPostTitle );
			await editorPage.insertPaymentButton( paymentButtonDetails );

			const errorShown = await editorPage.isErrorDisplayed();
			return assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );
		} );

		step( 'Can see the payment button inserted into the visual editor', async function () {
			const editorPage = await EditorPage.Expect( driver );
			return await editorPage.ensurePaymentButtonDisplayedInPost();
		} );

		step( 'Can publish and view content', async function () {
			const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
			await postEditorToolbarComponent.ensureSaved();
			await postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: true } );
		} );

		step( 'Can see the payment button in our published post', async function () {
			const viewPostPage = await ViewPostPage.Expect( driver );
			const displayed = await viewPostPage.paymentButtonDisplayed();
			assert.strictEqual(
				displayed,
				true,
				'The published post does not contain the payment button'
			);
		} );

		step(
			'The payment button in our published post opens a new Paypal window for payment',
			async function () {
				const numberOfOpenBrowserWindows = await driverHelper.numberOfOpenWindows( driver );
				assert.strictEqual(
					numberOfOpenBrowserWindows,
					1,
					'There is more than one open browser window before clicking payment button'
				);
				const viewPostPage = await ViewPostPage.Expect( driver );
				await viewPostPage.clickPaymentButton();
				// Skip some lines and checks until Chrome can handle multiple windows in app mode
				// await driverHelper.waitForNumberOfWindows( driver, 2 );
				// await driverHelper.switchToWindowByIndex( driver, 1 );
				await PaypalCheckoutPage.Expect( driver );
				// const amountDisplayed = await paypalCheckoutPage.priceDisplayed();
				// assert.strictEqual(
				// 	amountDisplayed,
				// 	`${ paymentButtonDetails.symbol }${ paymentButtonDetails.price } ${
				// 		paymentButtonDetails.currency
				// 	}`,
				// 	"The amount displayed on Paypal isn't correct"
				// );
				// await driverHelper.closeCurrentWindow( driver );
				// await driverHelper.switchToWindowByIndex( driver, 0 );
				// viewPostPage = await ViewPostPage.Expect( driver );
				// assert( await viewPostPage.displayed(), 'view post page is not displayed' );
			}
		);

		after( async function () {
			await driverHelper.ensurePopupsClosed( driver );
		} );
	} );

	describe( 'Revert a post to draft: @parallel @jetpack', function () {
		describe( 'Publish a new post', function () {
			const originalBlogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'To really be of help to others we need to be guided by compassion.\n— Dalai Lama\n';

			step( 'Can log in', async function () {
				this.loginFlow = new LoginFlow( driver );
				return await this.loginFlow.loginAndStartNewPost();
			} );

			step( 'Can enter post title and content', async function () {
				this.editorPage = await EditorPage.Expect( driver );
				await this.editorPage.enterTitle( originalBlogPostTitle );
				await this.editorPage.enterContent( blogPostQuote );

				const errorShown = await this.editorPage.isErrorDisplayed();
				return assert.strictEqual(
					errorShown,
					false,
					'There is an error shown on the editor page!'
				);
			} );

			step( 'Can publish the post', async function () {
				this.postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
				await this.postEditorToolbarComponent.ensureSaved();
				await this.postEditorToolbarComponent.publishThePost( { useConfirmStep: true } );

				await this.postEditorToolbarComponent.waitForSuccessViewPostNotice();
				const postPreviewComponent = await PostPreviewComponent.Expect( driver );

				return await postPreviewComponent.edit();
			} );
		} );

		describe( 'Revert the post to draft', function () {
			step( 'Can revert the post to draft', async function () {
				const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
				const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
				await postEditorSidebarComponent.revertToDraft();
				await postEditorToolbarComponent.waitForIsDraftStatus();
				const isDraft = await postEditorToolbarComponent.statusIsDraft();
				assert.strictEqual( isDraft, true, 'The post is not set as draft' );
			} );
		} );
	} );
} );
