/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';

import ViewPostPage from '../lib/pages/view-post-page.js';
import NotFoundPage from '../lib/pages/not-found-page.js';
import PostsPage from '../lib/pages/posts-page.js';
import ReaderPage from '../lib/pages/reader-page';
import ActivityPage from '../lib/pages/stats/activity-page';
import PaypalCheckoutPage from '../lib/pages/external/paypal-checkout-page';

import SidebarComponent from '../lib/components/sidebar-component.js';
import NoticesComponent from '../lib/components/notices-component.js';
import NavBarComponent from '../lib/components/nav-bar-component.js';
import PostPreviewComponent from '../lib/components/post-preview-component';
import RevisionsModalComponent from '../lib/components/revisions-modal-component';
import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';
import GutenbergEditorSidebarComponent from '../lib/gutenberg/gutenberg-editor-sidebar-component';
import SimplePaymentsBlockComponent from '../lib/gutenberg/blocks/payment-block-component';

import * as driverManager from '../lib/driver-manager';
import * as driverHelper from '../lib/driver-helper';
import * as mediaHelper from '../lib/media-helper';
import * as dataHelper from '../lib/data-helper';
import * as SlackNotifier from '../lib/slack-notifier';
import EmbedsBlockComponent from '../lib/gutenberg/blocks/embeds-block-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser =
	process.env.GUTENBERG_EDGE === 'true' ? 'gutenbergSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

let driver;

before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Calypso Gutenberg Editor: Posts (${ screenSize })`, function() {
	this.timeout( mochaTimeOut );

	describe( 'Public Posts: Preview and Publish a Public Post @parallel', function() {
		let fileDetails;
		const blogPostTitle = dataHelper.randomPhrase();
		const blogPostQuote =
			'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';
		const newCategoryName = 'Category ' + new Date().getTime().toString();
		const newTagName = 'Tag ' + new Date().getTime().toString();

		// Create image file for upload
		before( async function() {
			fileDetails = await mediaHelper.createFile();
			return fileDetails;
		} );

		step( 'Can log in', async function() {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can enter post title, content and image', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.enterTitle( blogPostTitle );
			await gEditorComponent.enterText( blogPostQuote );
			await gEditorComponent.addImage( fileDetails );

			await gEditorComponent.openSidebar();
			const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
			await gEditorSidebarComponent.enterImageAltText( fileDetails );
			await gEditorComponent.closeSidebar();

			const errorShown = await gEditorComponent.errorDisplayed();
			return assert.strictEqual(
				errorShown,
				false,
				'There is an error shown on the Gutenberg editor page!'
			);
		} );

		step( 'Expand Categories and Tags', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.openSidebar();
			const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
			await gEditorSidebarComponent.selectDocumentTab();
			await gEditorSidebarComponent.collapseStatusAndVisibility(); // Status and visibility starts opened
			await gEditorSidebarComponent.expandCategories();
			await gEditorSidebarComponent.expandTags();
		} );

		step( 'Can add a new category', async function() {
			const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
			await gEditorSidebarComponent.addNewCategory( newCategoryName );
		} );

		step( 'Can add a new tag', async function() {
			const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
			await gEditorSidebarComponent.addNewTag( newTagName );
			const tagDisplayed = await gEditorSidebarComponent.tagEventuallyDisplayed( newTagName );
			assert.strictEqual(
				tagDisplayed,
				true,
				`The newly added tag '${ newTagName }' was not added to the Gutenberg post`
			);
		} );

		step( 'Close categories and tags', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
			await gEditorSidebarComponent.selectDocumentTab();
			await gEditorSidebarComponent.collapseCategories();
			await gEditorSidebarComponent.collapseTags();
			await gEditorComponent.closeSidebar();
		} );

		step( 'Can launch post preview', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.ensureSaved();
			await gEditorComponent.launchPreview();
		} );

		step( 'Can see correct post title in preview', async function() {
			this.postPreviewComponent = await PostPreviewComponent.Expect( driver );

			const postTitle = await this.postPreviewComponent.postTitle();
			assert.strictEqual(
				postTitle.toLowerCase(),
				blogPostTitle.toLowerCase(),
				'The blog post preview title is not correct'
			);
		} );

		step( 'Can see correct post content in preview', async function() {
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

		step( 'Can see the post category in preview', async function() {
			const categoryDisplayed = await this.postPreviewComponent.categoryDisplayed();
			assert.strictEqual(
				categoryDisplayed.toUpperCase(),
				newCategoryName.toUpperCase(),
				'The tag: ' + newCategoryName + ' is not being displayed on the post'
			);
		} );

		// Disable this step until https://github.com/Automattic/wp-calypso/issues/28974 is solved
		// step( 'Can see the post tag in preview', async function() {
		// 	let tagDisplayed = await this.postPreviewComponent.tagDisplayed();
		// 	assert.strictEqual(
		// 		tagDisplayed.toUpperCase(),
		// 		newTagName.toUpperCase(),
		// 		'The tag: ' + newTagName + ' is not being displayed on the post'
		// 	);
		// } );

		step( 'Can see the image in preview', async function() {
			const imageDisplayed = await this.postPreviewComponent.imageDisplayed( fileDetails );
			assert.strictEqual( imageDisplayed, true, 'Could not see the image in the web preview' );
		} );

		step( 'Can close post preview', async function() {
			await this.postPreviewComponent.close();
		} );

		step( 'Can publish and view content', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.publish( { visit: true } );
		} );

		step( 'Can see correct post title', async function() {
			const viewPostPage = await ViewPostPage.Expect( driver );
			const postTitle = await viewPostPage.postTitle();
			assert.strictEqual(
				postTitle.toLowerCase(),
				blogPostTitle.toLowerCase(),
				'The published blog post title is not correct'
			);
		} );

		step( 'Can see correct post content', async function() {
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

		step( 'Can see correct post category', async function() {
			const viewPostPage = await ViewPostPage.Expect( driver );
			const categoryDisplayed = await viewPostPage.categoryDisplayed();
			assert.strictEqual(
				categoryDisplayed.toUpperCase(),
				newCategoryName.toUpperCase(),
				'The category: ' + newCategoryName + ' is not being displayed on the post'
			);
		} );

		step( 'Can see the image published', async function() {
			const viewPostPage = await ViewPostPage.Expect( driver );
			const imageDisplayed = await viewPostPage.imageDisplayed( fileDetails );
			assert.strictEqual( imageDisplayed, true, 'Could not see the image in the published post' );
		} );

		// Disable this step until https://github.com/Automattic/wp-calypso/issues/28974 is solved
		// step( 'Can see correct post tag', async function() {
		// 	const viewPostPage = await ViewPostPage.Expect( driver );
		// 	let tagDisplayed = await viewPostPage.tagDisplayed();
		// 	assert.strictEqual(
		// 		tagDisplayed.toUpperCase(),
		// 		newTagName.toUpperCase(),
		// 		'The tag: ' + newTagName + ' is not being displayed on the post'
		// 	);
		// } );

		after( async function() {
			if ( fileDetails ) {
				await mediaHelper.deleteFile( fileDetails );
			}
			await driverHelper.acceptAlertIfPresent( driver );
		} );
	} );

	describe( 'Basic Public Post @canary @parallel', function() {
		describe( 'Publish a New Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'“Whenever you find yourself on the side of the majority, it is time to pause and reflect.”\n- Mark Twain';

			step( 'Can log in', async function() {
				this.loginFlow = new LoginFlow( driver, gutenbergUser );
				return await this.loginFlow.login( { useFreshLogin: true } );
			} );

			step( 'Start new post', async function() {
				const navBarComponent = await NavBarComponent.Expect( driver );
				await navBarComponent.clickMySites();
				const sidebarComponent = await SidebarComponent.Expect( driver );
				await sidebarComponent.selectPosts();
				const postsPage = await PostsPage.Expect( driver );
				return await postsPage.addNewPost();
			} );

			step( 'Can enter post title and text content', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.initEditor();
				await gEditorComponent.enterTitle( blogPostTitle );
				await gEditorComponent.enterText( blogPostQuote );

				const errorShown = await gEditorComponent.errorDisplayed();
				return assert.strictEqual(
					errorShown,
					false,
					'There is an error shown on the Gutenberg editor page!'
				);
			} );

			step( 'Can see the Earn blocks', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.openBlockInserterAndSearch( 'earn' );
				assert.strictEqual(
					await gEditorComponent.isBlockCategoryPresent( 'Earn' ),
					true,
					'Earn (Jetpack) blocks are not present'
				);
				await gEditorComponent.closeBlockInserter();
			} );

			step( 'Can see the Grow blocks', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.openBlockInserterAndSearch( 'grow' );
				assert.strictEqual(
					await gEditorComponent.isBlockCategoryPresent( 'Grow' ),
					true,
					'Grow (Jetpack) blocks are not present'
				);
				await gEditorComponent.closeBlockInserter();
			} );

			step( 'Can publish and view content', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.publish( { visit: true } );
			} );

			step( 'Can see correct post title', async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const postTitle = await viewPostPage.postTitle();
				assert.strictEqual(
					postTitle.toLowerCase(),
					blogPostTitle.toLowerCase(),
					'The published blog post title is not correct'
				);
			} );
		} );
	} );

	describe( 'Check Activity Log for Public Post @parallel', function() {
		const blogPostTitle = dataHelper.randomPhrase();
		const blogPostQuote =
			'“We are what we pretend to be, so we must be careful about what we pretend to be”\n- Kurt Vonnegut';

		step( 'Can log in', async function() {
			const loginFlow = new LoginFlow( driver, gutenbergUser );
			return await loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can enter post title and content', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.enterTitle( blogPostTitle );
			await gEditorComponent.enterText( blogPostQuote );

			const errorShown = await gEditorComponent.errorDisplayed();
			return assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );
		} );

		step( 'Can publish and view content', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.publish( { visit: true } );
		} );

		step( 'Can see the post in the Activity log', async function() {
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

		after( async function() {
			await driverHelper.acceptAlertIfPresent( driver );
		} );
	} );

	describe( 'Schedule Basic Public Post @parallel', function() {
		describe( 'Schedule (and remove) a New Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote = '“Worries shared are worries halved.”\n- Unknown';

			step( 'Can log in', async function() {
				this.loginFlow = new LoginFlow( driver, gutenbergUser );
				return await this.loginFlow.loginAndStartNewPost( null, true );
			} );

			step( 'Can enter post title and content', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.enterTitle( blogPostTitle );
				await gEditorComponent.enterText( blogPostQuote );

				const errorShown = await gEditorComponent.errorDisplayed();
				return assert.strictEqual(
					errorShown,
					false,
					'There is an error shown on the editor page!'
				);
			} );

			step(
				'Can schedule content for a future date and see correct publish date',
				async function() {
					const gSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
					await gSidebarComponent.displayComponentIfNecessary();
					await gSidebarComponent.chooseDocumentSettings();
					const publishDate = await gSidebarComponent.scheduleFuturePost();

					const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
					return await gEditorComponent.schedulePost( publishDate );
				}
			);

			step( 'Remove scheduled post', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.closeScheduledPanel();
				const gSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
				await gSidebarComponent.selectDocumentTab();
				await gSidebarComponent.trashPost();
			} );

			step( 'Can then see the Posts page with a confirmation message', async function() {
				const noticesComponent = await NoticesComponent.Expect( driver );
				const displayed = await noticesComponent.isSuccessNoticeDisplayed();
				return assert.strictEqual(
					displayed,
					true,
					'The Posts page success notice for deleting the post is not displayed'
				);
			} );

			after( async function() {
				await driverHelper.acceptAlertIfPresent( driver );
			} );
		} );
	} );

	describe( 'Private Posts: @parallel', function() {
		describe( 'Publish a Private Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'If you’re not prepared to be wrong; you’ll never come up with anything original.\n— Sir Ken Robinson';

			step( 'Can log in', async function() {
				this.loginFlow = new LoginFlow( driver, gutenbergUser );
				return await this.loginFlow.loginAndStartNewPost( null, true );
			} );

			step( 'Can enter post title and content', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.enterTitle( blogPostTitle );
				return await gEditorComponent.enterText( blogPostQuote );
				// Temporarily disable ensureSaved() to prevent error:
				// "Timed out waiting for element with css selector of 'span.is-saved' to be present and displayed"
				// return await gEditorComponent.ensureSaved();
			} );

			step( 'Can disable sharing buttons', async function() {
				return await SlackNotifier.warn(
					'Sharing buttons not currently available for Gutenberg in Calypso'
				);
				//let postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
				//await postEditorSidebarComponent.expandSharingSection();
				//await postEditorSidebarComponent.setSharingButtons( false );
				//await postEditorSidebarComponent.closeSharingSection();
			} );

			step( 'Can allow comments', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.openSidebar();
				const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
				await gEditorSidebarComponent.selectDocumentTab();
				await gEditorSidebarComponent.collapseStatusAndVisibility(); // Status and visibility starts opened
				await gEditorSidebarComponent.expandDiscussion();
				return await gEditorSidebarComponent.setCommentsPreference( { allow: true } );
			} );

			step(
				'Set to private which publishes it - Can set visibility to private which immediately publishes it',
				async function() {
					const gSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
					await gSidebarComponent.chooseDocumentSettings();
					await gSidebarComponent.expandStatusAndVisibility();
					await gSidebarComponent.setVisibilityToPrivate();
					await gSidebarComponent.hideComponentIfNecessary();
					const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
					return await gEditorComponent.waitForSuccessViewPostNotice();
				}
			);

			step( 'Can view content', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				return await gEditorComponent.viewPublishedPostOrPage();
			} );

			step( 'As a logged in user - Can see correct post title', async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const postTitle = await viewPostPage.postTitle();
				assert.strictEqual(
					postTitle.toLowerCase(),
					'private: ' + blogPostTitle.toLowerCase(),
					'The published blog post title is not correct'
				);
			} );

			step( 'Can see correct post content', async function() {
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

			step( 'Can see comments enabled', async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const visible = await viewPostPage.commentsVisible();
				assert.strictEqual(
					visible,
					true,
					'Comments are not shown even though they were enabled when creating the post.'
				);
			} );

			step( "Can't see sharing buttons", async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const visible = await viewPostPage.sharingButtonsVisible();
				assert.strictEqual(
					visible,
					false,
					'Sharing buttons are shown even though they were disabled when creating the post.'
				);
			} );

			step( 'Ensure we are not logggd in', async function() {
				await driverManager.clearCookiesAndDeleteLocalStorage( driver );
				await driver.navigate().refresh();
			} );

			step( "As a non-logged in user - Can't see post at all", async function() {
				const notFoundPage = await NotFoundPage.Expect( driver );
				const displayed = await notFoundPage.displayed();
				assert.strictEqual(
					displayed,
					true,
					'Could not see the not found (404) page. Check that it is displayed'
				);
			} );

			after( async function() {
				await driverHelper.acceptAlertIfPresent( driver );
			} );
		} );
	} );

	describe( 'Password Protected Posts: @parallel', function() {
		describe( 'Publish a Password Protected Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'The best thing about the future is that it comes only one day at a time.\n— Abraham Lincoln';
			const postPassword = 'e2e' + new Date().getTime().toString();

			step( 'Can log in', async function() {
				const loginFlow = new LoginFlow( driver, gutenbergUser );
				await loginFlow.loginAndStartNewPost( null, true );
			} );

			step( 'Can enter post title and content and set to password protected', async function() {
				let gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.enterTitle( blogPostTitle );

				const errorShown = await gEditorComponent.errorDisplayed();
				assert.strictEqual(
					errorShown,
					false,
					'There is an error shown on the Gutenberg editor page!'
				);

				const gSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
				await gSidebarComponent.chooseDocumentSettings();
				await gSidebarComponent.setVisibilityToPasswordProtected( postPassword );
				await gSidebarComponent.hideComponentIfNecessary();

				gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				return await gEditorComponent.enterText( blogPostQuote );
			} );

			step( 'Can publish and view content', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.publish( { visit: true } );
			} );
			step( 'As a logged in user, With no password entered, Can view page title', async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const actualPostTitle = await viewPostPage.postTitle();
				assert.strictEqual(
					actualPostTitle.toUpperCase(),
					( 'Protected: ' + blogPostTitle ).toUpperCase()
				);
			} );

			step( 'Can see password field', async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const isPasswordProtected = await viewPostPage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					true,
					'The post does not appear to be password protected'
				);
			} );

			step( "Can't see content when no password is entered", async function() {
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

			step( 'With incorrect password entered, Enter incorrect password', async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				await viewPostPage.enterPassword( 'password' );
			} );

			step( 'Can view post title', async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const actualPostTitle = await viewPostPage.postTitle();
				assert.strictEqual(
					actualPostTitle.toUpperCase(),
					( 'Protected: ' + blogPostTitle ).toUpperCase()
				);
			} );

			step( 'Can see password field', async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const isPasswordProtected = await viewPostPage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					true,
					'The post does not appear to be password protected'
				);
			} );

			step( "Can't see content when incorrect password is entered", async function() {
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

			step( 'With correct password entered, Enter correct password', async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				await viewPostPage.enterPassword( postPassword );
			} );

			step( 'Can view post title', async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const actualPostTitle = await viewPostPage.postTitle();
				assert.strictEqual(
					actualPostTitle.toUpperCase(),
					( 'Protected: ' + blogPostTitle ).toUpperCase()
				);
			} );

			step( "Can't see password field", async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const isPasswordProtected = await viewPostPage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					false,
					'The post still seems to be password protected'
				);
			} );

			step( 'Can see post content', async function() {
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

			step( 'As a non-logged in user, Clear cookies (log out)', async function() {
				await driver.manage().deleteAllCookies();
				await driver.navigate().refresh();
			} );

			step( 'With no password entered, Can view page title', async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const actualPostTitle = await viewPostPage.postTitle();
				assert.strictEqual(
					actualPostTitle.toUpperCase(),
					( 'Protected: ' + blogPostTitle ).toUpperCase()
				);
			} );

			step( 'Can see password field', async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const isPasswordProtected = await viewPostPage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					true,
					'The post does not appear to be password protected'
				);
			} );

			step( "Can't see content when no password is entered", async function() {
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

			step( 'With incorrect password entered, Enter incorrect password', async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				await viewPostPage.enterPassword( 'password' );
			} );

			step( 'Can view post title', async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const actualPostTitle = await viewPostPage.postTitle();
				assert.strictEqual(
					actualPostTitle.toUpperCase(),
					( 'Protected: ' + blogPostTitle ).toUpperCase()
				);
			} );

			step( 'Can see password field', async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const isPasswordProtected = await viewPostPage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					true,
					'The post does not appear to be password protected'
				);
			} );

			step( "Can't see content when incorrect password is entered", async function() {
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

			step( 'With correct password entered, Enter correct password', async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				await viewPostPage.enterPassword( postPassword );
			} );

			step( 'Can view post title', async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const actualPostTitle = await viewPostPage.postTitle();
				assert.strictEqual(
					actualPostTitle.toUpperCase(),
					( 'Protected: ' + blogPostTitle ).toUpperCase()
				);
			} );

			step( "Can't see password field", async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const isPasswordProtected = await viewPostPage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					false,
					'The page still seems to be password protected'
				);
			} );

			step( 'Can see page content', async function() {
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

			after( async function() {
				await driverHelper.acceptAlertIfPresent( driver );
			} );
		} );
	} );

	describe( 'Trash Post: @parallel', function() {
		describe( 'Trash a New Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'The only victory that counts is the victory over yourself.\n— Jesse Owens\n';

			step( 'Can log in', async function() {
				const loginFlow = new LoginFlow( driver, gutenbergUser );
				return await loginFlow.loginAndStartNewPost( null, true );
			} );

			step( 'Can enter post title and content', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.enterTitle( blogPostTitle );
				await gEditorComponent.enterText( blogPostQuote );
				return gEditorComponent.ensureSaved();
			} );

			step( 'Can trash the new post', async function() {
				const gSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
				await gSidebarComponent.chooseDocumentSettings();
				return await gSidebarComponent.trashPost();
			} );

			step( 'Can then see the Posts page with a confirmation message', async function() {
				const noticesComponent = await NoticesComponent.Expect( driver );
				const displayed = await noticesComponent.isSuccessNoticeDisplayed();
				return assert.strictEqual(
					displayed,
					true,
					'The Posts page success notice for deleting the post is not displayed'
				);
			} );

			after( async function() {
				await driverHelper.acceptAlertIfPresent( driver );
			} );
		} );
	} );

	describe( 'Edit a Post: @parallel', function() {
		describe( 'Publish a New Post', function() {
			const originalBlogPostTitle = dataHelper.randomPhrase();
			const updatedBlogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'Science is organised knowledge. Wisdom is organised life..\n~ Immanuel Kant';

			step( 'Can log in', async function() {
				const loginFlow = new LoginFlow( driver, gutenbergUser );
				return await loginFlow.loginAndStartNewPost( null, true );
			} );

			step( 'Can enter post title and content', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.enterTitle( originalBlogPostTitle );
				await gEditorComponent.enterText( blogPostQuote );
				const errorShown = await gEditorComponent.errorDisplayed();
				return assert.strictEqual(
					errorShown,
					false,
					'There is an error shown on the editor page!'
				);
			} );

			step( 'Can publish the post', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.publish( { visit: true } );
			} );

			describe( 'Edit the post via posts', function() {
				step( 'Can view the posts list', async function() {
					await ReaderPage.Visit( driver );
					const navbarComponent = await NavBarComponent.Expect( driver );
					await navbarComponent.clickMySites();
					const jetpackSiteName = dataHelper.getJetpackSiteName();
					const sidebarComponent = await SidebarComponent.Expect( driver );
					if ( host !== 'WPCOM' ) {
						await sidebarComponent.selectSite( jetpackSiteName );
					}
					await sidebarComponent.selectPosts();
					return await PostsPage.Expect( driver );
				} );

				step( 'Can see and edit our new post', async function() {
					const postsPage = await PostsPage.Expect( driver );
					await postsPage.waitForPostTitled( originalBlogPostTitle );
					const displayed = await postsPage.isPostDisplayed( originalBlogPostTitle );
					assert.strictEqual(
						displayed,
						true,
						`The blog post titled '${ originalBlogPostTitle }' is not displayed in the list of posts`
					);
					await postsPage.editPostWithTitle( originalBlogPostTitle );
					return await GutenbergEditorComponent.Expect( driver );
				} );

				step( 'Can see the post title', async function() {
					const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
					const titleShown = await gEditorComponent.titleShown();
					assert.strictEqual(
						titleShown,
						originalBlogPostTitle,
						'The blog post title shown was unexpected'
					);
				} );

				step(
					'Can set the new title and update it, and link to the updated post',
					async function() {
						const gEditorComponent = await GutenbergEditorComponent.Expect( driver );

						await gEditorComponent.enterTitle( updatedBlogPostTitle );
						const errorShown = await gEditorComponent.errorDisplayed();
						assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );
						return await gEditorComponent.update( { visit: true } );
					}
				);

				describe( 'Can view the post with the new title', function() {
					step( 'Can view the post', async function() {
						return await ViewPostPage.Expect( driver );
					} );

					step( 'Can see correct post title', async function() {
						const viewPostPage = await ViewPostPage.Expect( driver );
						const postTitle = await viewPostPage.postTitle();
						return assert.strictEqual(
							postTitle.toLowerCase(),
							updatedBlogPostTitle.toLowerCase(),
							'The published blog post title is not correct'
						);
					} );
				} );
			} );
		} );

		after( async function() {
			await driverHelper.acceptAlertIfPresent( driver );
		} );
	} );

	describe( 'Insert a contact form: @parallel', function() {
		describe( 'Publish a New Post with a Contact Form', function() {
			const originalBlogPostTitle = 'Contact Us: ' + dataHelper.randomPhrase();
			const contactEmail = 'testing@automattic.com';
			const subject = "Let's work together";

			step( 'Can log in', async function() {
				const loginFlow = new LoginFlow( driver, gutenbergUser );
				return await loginFlow.loginAndStartNewPost( null, true );
			} );

			step( 'Can insert the contact form', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.enterTitle( originalBlogPostTitle );
				await gEditorComponent.insertContactForm( contactEmail, subject );
				await gEditorComponent.ensureSaved();

				const errorShown = await gEditorComponent.errorDisplayed();
				assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );

				const contactFormDisplayedInEditor = await gEditorComponent.contactFormDisplayedInEditor();
				assert.strictEqual(
					contactFormDisplayedInEditor,
					true,
					'The contact form is not displayed in the editor'
				);
			} );

			step( 'Can publish and view content', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.publish( { visit: true } );
			} );

			step( 'Can see the contact form in our published post', async function() {
				this.viewPostPage = await ViewPostPage.Expect( driver );
				const displayed = await this.viewPostPage.contactFormDisplayed();
				assert.strictEqual(
					displayed,
					true,
					'The published post does not contain the contact form'
				);
			} );

			after( async function() {
				await driverHelper.acceptAlertIfPresent( driver );
			} );
		} );
	} );

	describe( 'Insert a payment button: @parallel', function() {
		const paymentButtonDetails = {
			title: 'Button',
			description: 'Description',
			symbol: '$',
			price: '1.99',
			currency: 'USD',
			allowQuantity: true,
			email: 'test@wordpress.com',
		};

		step( 'Can log in', async function() {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can insert the payment button', async function() {
			const blogPostTitle = 'Payment Button: ' + dataHelper.randomPhrase();
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			const blockId = await gEditorComponent.addBlock( 'Simple Payments' );

			const gPaymentComponent = await SimplePaymentsBlockComponent.Expect( driver, blockId );
			await gPaymentComponent.insertPaymentButtonDetails( paymentButtonDetails );

			const errorShown = await gEditorComponent.errorDisplayed();
			assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );

			await gEditorComponent.enterTitle( blogPostTitle );
			await gEditorComponent.ensureSaved();
			return await gPaymentComponent.ensurePaymentButtonDisplayedInEditor();
		} );

		step( 'Can publish and view content', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		step( 'Can see the payment button in our published post', async function() {
			const viewPostPage = await ViewPostPage.Expect( driver );
			const displayed = await viewPostPage.paymentButtonDisplayed();
			return assert.strictEqual(
				displayed,
				true,
				'The published post does not contain the payment button'
			);
		} );

		step(
			'The payment button in our published post opens a new Paypal window for payment',
			async function() {
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

		after( async function() {
			await driverHelper.acceptAlertIfPresent( driver );
			await driverHelper.ensurePopupsClosed( driver );
		} );
	} );

	describe( 'Use the Calypso Media Modal: @parallel', function() {
		let fileDetails;

		// Create image file for upload
		before( async function() {
			fileDetails = await mediaHelper.createFile();
			return fileDetails;
		} );

		step( 'Can log in', async function() {
			const loginFlow = new LoginFlow( driver, gutenbergUser );
			return await loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can insert an image in an Image block with the Media Modal', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.addImageFromMediaModal( fileDetails );
		} );
	} );

	describe( 'Revert a post to draft: @parallel', function() {
		describe( 'Publish a new post', function() {
			const originalBlogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'To really be of help to others we need to be guided by compassion.\n— Dalai Lama';

			step( 'Can log in', async function() {
				const loginFlow = new LoginFlow( driver, gutenbergUser );
				return await loginFlow.loginAndStartNewPost( null, true );
			} );

			step( 'Can enter post title and content', async function() {
				const gHeaderComponent = await GutenbergEditorComponent.Expect( driver );
				await gHeaderComponent.enterTitle( originalBlogPostTitle );
				await gHeaderComponent.enterText( blogPostQuote );

				const errorShown = await gHeaderComponent.errorDisplayed();
				return assert.strictEqual(
					errorShown,
					false,
					'There is an error shown on the Gutenberg editor page!'
				);
			} );

			step( 'Can publish the post', async function() {
				const gHeaderComponent = await GutenbergEditorComponent.Expect( driver );
				return await gHeaderComponent.publish();
			} );
		} );

		describe( 'Revert the post to draft', function() {
			step( 'Can revert the post to draft', async function() {
				const gHeaderComponent = await GutenbergEditorComponent.Expect( driver );
				await gHeaderComponent.dismissSuccessNotice();
				await gHeaderComponent.revertToDraft();
				const isDraft = await gHeaderComponent.isDraft();
				assert.strictEqual( isDraft, true, 'The post is not set as draft' );
			} );
		} );

		after( async function() {
			await driverHelper.acceptAlertIfPresent( driver );
		} );
	} );

	describe( 'Insert embeds: @parallel', function() {
		step( 'Can log in', async function() {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can insert Embeds block', async function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.enterTitle( 'Embeds: ' + blogPostTitle );

			this.instagramEditorSelector = '.wp-block-embed-instagram';
			const blockIdInstagram = await gEditorComponent.addBlock( 'Instagram' );
			const gEmbedsComponentInstagram = await EmbedsBlockComponent.Expect(
				driver,
				blockIdInstagram
			);
			await gEmbedsComponentInstagram.embedUrl( 'https://www.instagram.com/p/BlDOZMil933/' );
			await gEmbedsComponentInstagram.isEmbeddedInEditor( this.instagramEditorSelector );

			this.twitterEditorSelector = '.wp-block-embed-twitter';
			const blockIdTwitter = await gEditorComponent.addBlock( 'Twitter' );
			const gEmbedsComponentTwitter = await EmbedsBlockComponent.Expect( driver, blockIdTwitter );
			await gEmbedsComponentTwitter.embedUrl(
				'https://twitter.com/automattic/status/1067120832676327424'
			);
			await gEmbedsComponentTwitter.isEmbeddedInEditor( this.twitterEditorSelector );

			this.youtubeEditorSelector = '.wp-block-embed-youtube';
			const blockIdYouTube = await gEditorComponent.addBlock( 'YouTube' );
			const gEmbedsComponentYouTube = await EmbedsBlockComponent.Expect( driver, blockIdYouTube );
			await gEmbedsComponentYouTube.embedUrl( 'https://www.youtube.com/watch?v=xifhQyopjZM' );
			await gEmbedsComponentYouTube.isEmbeddedInEditor( this.youtubeEditorSelector );

			const errorShown = await gEditorComponent.errorDisplayed();
			return assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );
		} );

		step( 'Can publish and view content', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		step( 'Can see embedded content in our published post', async function() {
			const viewPostPage = await ViewPostPage.Expect( driver );
			this.youtubePostSelector = '.youtube-player';
			await viewPostPage.embedContentDisplayed( this.youtubePostSelector ); // check YouTube content
			this.instagramPostSelector = '.instagram-media-rendered';
			await viewPostPage.embedContentDisplayed( this.instagramPostSelector ); // check Instagram content
			this.instagramPostSelector = '.twitter-tweet-rendered';
			return await viewPostPage.embedContentDisplayed( this.instagramPostSelector ); // check Twitter content
		} );

		after( async function() {
			await driverHelper.acceptAlertIfPresent( driver );
		} );
	} );

	describe( 'Can Share Posts From Reader (PressThis)! @parallel', function() {
		step( 'Can log in', async function() {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			await this.loginFlow.login();
			return await this.loginFlow.checkForDevDocsAndRedirectToReader();
		} );

		step( 'Find a post to share (press this)', async function() {
			const readerPage = await ReaderPage.Expect( driver );
			const sharePostError = await readerPage.shareLatestPost();
			if ( sharePostError instanceof Error ) {
				throw sharePostError;
			}
		} );

		step( 'Block Editor loads with shared content', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.initEditor();
		} );

		step( 'Can publish and view content', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		step( 'Can see a post title and post content', async function() {
			const viewPostPage = await ViewPostPage.Expect( driver );
			const postTitle = await viewPostPage.postTitle();
			const postContent = await viewPostPage.postContent();
			assert( postTitle.length > 0, 'Press This did not copy a post title!' );
			return assert( postContent.length > 0, 'Press This did not copy any post content!' );
		} );
	} );

	describe( 'Use the Calypso revisions modal @parallel', function() {
		const originalTitle = dataHelper.randomPhrase();
		const updatedTitle = dataHelper.randomPhrase();
		const originalContent = 'Details matter, it’s worth waiting to get it right. ~ Steve Jobs';
		const updatedContent =
			'Your most unhappy customers are your greatest source of learning. ~ Bill Gates';

		step( 'Can log in', async function() {
			const loginFlow = new LoginFlow( driver, gutenbergUser );
			await loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can enter post title and text content', async function() {
			const editor = await GutenbergEditorComponent.Expect( driver );
			await editor.enterTitle( originalTitle );
			await editor.enterText( originalContent );
			await editor.ensureSaved();
		} );

		step( 'Can update post title and text content', async function() {
			const editor = await GutenbergEditorComponent.Expect( driver );
			await editor.enterTitle( updatedTitle );
			await editor.replaceTextOnLastParagraph( updatedContent );
			await editor.ensureSaved();
		} );

		step( 'Can open the revisions modal', async function() {
			const editor = await GutenbergEditorComponent.Expect( driver );
			await editor.openSidebar();
			const sidebar = await GutenbergEditorSidebarComponent.Expect( driver );
			await sidebar.selectDocumentTab();
			await sidebar.openRevisionsDialog();
		} );

		step( 'Can restore the previous revision', async function() {
			const revisions = await RevisionsModalComponent.Expect( driver );
			await revisions.loadFirstRevision();

			const editor = await GutenbergEditorComponent.Expect( driver );
			await editor.closeSidebar();
			await editor.ensureSaved();
			const title = await editor.getTitle();
			const content = await editor.getContent();
			assert.strictEqual( title, originalTitle, 'The restored post title is not correct' );
			assert.strictEqual( content, originalContent, 'The restored post content is not correct' );
		} );
	} );
} );
