/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';

import ViewPostPage from '../../lib/pages/view-post-page.js';
import NotFoundPage from '../../lib/pages/not-found-page.js';
import PostsPage from '../../lib/pages/posts-page.js';
import ReaderPage from '../../lib/pages/reader-page';
import PaypalCheckoutPage from '../../lib/pages/external/paypal-checkout-page';

import SidebarComponent from '../../lib/components/sidebar-component.js';
import NoticesComponent from '../../lib/components/notices-component.js';
import NavBarComponent from '../../lib/components/nav-bar-component.js';
import PostPreviewComponent from '../../lib/components/post-preview-component';
import RevisionsModalComponent from '../../lib/components/revisions-modal-component';
import GutenbergEditorComponent from '../../lib/gutenberg/gutenberg-editor-component';
import GutenbergEditorSidebarComponent from '../../lib/gutenberg/gutenberg-editor-sidebar-component';
import SimplePaymentsBlockComponent from '../../lib/gutenberg/blocks/payment-block-component';

import * as driverManager from '../../lib/driver-manager';
import * as driverHelper from '../../lib/driver-helper';
import * as mediaHelper from '../../lib/media-helper';
import * as dataHelper from '../../lib/data-helper';
import * as SlackNotifier from '../../lib/slack-notifier';
import EmbedsBlockComponent from '../../lib/gutenberg/blocks/embeds-block-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser =
	process.env.GUTENBERG_EDGE === 'true' ? 'gutenbergSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

describe( `[${ host }] Calypso Gutenberg Editor: Posts (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	let driver;

	before( 'Start browser', async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	describe( 'Public Posts: Preview and Publish a Public Post @parallel', function () {
		let fileDetails;
		const blogPostTitle = dataHelper.randomPhrase();
		const blogPostQuote =
			'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';
		const newCategoryName = 'Category ' + new Date().getTime().toString();
		const newTagName = 'Tag ' + new Date().getTime().toString();

		// Create image file for upload
		before( async function () {
			fileDetails = await mediaHelper.createFile();
			return fileDetails;
		} );

		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can enter post title, content and image', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.enterTitle( blogPostTitle );
			await gEditorComponent.enterText( blogPostQuote );
			await gEditorComponent.addImage( fileDetails );

			await gEditorComponent.openSidebar();
			const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
			await gEditorSidebarComponent.enterImageAltText( fileDetails );
			await gEditorComponent.closeSidebar();
		} );

		it( 'Expand Categories and Tags', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.openSidebar();
			const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
			await gEditorSidebarComponent.selectDocumentTab();
			await gEditorSidebarComponent.collapseStatusAndVisibility(); // Status and visibility starts opened
			await gEditorSidebarComponent.expandCategories();
			await gEditorSidebarComponent.expandTags();
		} );

		it( 'Can add a new category', async function () {
			const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
			await gEditorSidebarComponent.addNewCategory( newCategoryName );
		} );

		it( 'Can add a new tag', async function () {
			const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
			await gEditorSidebarComponent.addNewTag( newTagName );
			const tagDisplayed = await gEditorSidebarComponent.tagEventuallyDisplayed( newTagName );
			assert.strictEqual(
				tagDisplayed,
				true,
				`The newly added tag '${ newTagName }' was not added to the Gutenberg post`
			);
		} );

		it( 'Close categories and tags', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
			await gEditorSidebarComponent.selectDocumentTab();
			await gEditorSidebarComponent.collapseCategories();
			await gEditorSidebarComponent.collapseTags();
			await gEditorComponent.closeSidebar();
		} );

		it( 'Can launch post preview', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.ensureSaved();
			await gEditorComponent.launchPreview();
		} );

		it( 'Can see correct post title in preview', async function () {
			this.postPreviewComponent = await PostPreviewComponent.Expect( driver );

			const postTitle = await this.postPreviewComponent.postTitle();
			assert.strictEqual(
				postTitle.toLowerCase(),
				blogPostTitle.toLowerCase(),
				'The blog post preview title is not correct'
			);
		} );

		it( 'Can see correct post content in preview', async function () {
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

		it( 'Can see the post category in preview', async function () {
			const categoryDisplayed = await this.postPreviewComponent.categoryDisplayed();
			assert.strictEqual(
				categoryDisplayed.toUpperCase(),
				newCategoryName.toUpperCase(),
				'The tag: ' + newCategoryName + ' is not being displayed on the post'
			);
		} );

		// Disable this step until https://github.com/Automattic/wp-calypso/issues/28974 is solved
		// it( 'Can see the post tag in preview', async function() {
		// 	let tagDisplayed = await this.postPreviewComponent.tagDisplayed();
		// 	assert.strictEqual(
		// 		tagDisplayed.toUpperCase(),
		// 		newTagName.toUpperCase(),
		// 		'The tag: ' + newTagName + ' is not being displayed on the post'
		// 	);
		// } );

		it( 'Can see the image in preview', async function () {
			const imageDisplayed = await this.postPreviewComponent.imageDisplayed( fileDetails );
			assert.strictEqual( imageDisplayed, true, 'Could not see the image in the web preview' );
		} );

		it( 'Can close post preview', async function () {
			await this.postPreviewComponent.close();
		} );

		it( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.publish( { visit: true } );
		} );

		it( 'Can see correct post title', async function () {
			const viewPostPage = await ViewPostPage.Expect( driver );
			const postTitle = await viewPostPage.postTitle();
			assert.strictEqual(
				postTitle.toLowerCase(),
				blogPostTitle.toLowerCase(),
				'The published blog post title is not correct'
			);
		} );

		it( 'Can see correct post content', async function () {
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

		it( 'Can see correct post category', async function () {
			const viewPostPage = await ViewPostPage.Expect( driver );
			const categoryDisplayed = await viewPostPage.categoryDisplayed();
			assert.strictEqual(
				categoryDisplayed.toUpperCase(),
				newCategoryName.toUpperCase(),
				'The category: ' + newCategoryName + ' is not being displayed on the post'
			);
		} );

		it( 'Can see the image published', async function () {
			const viewPostPage = await ViewPostPage.Expect( driver );
			const imageDisplayed = await viewPostPage.imageDisplayed( fileDetails );
			assert.strictEqual( imageDisplayed, true, 'Could not see the image in the published post' );
		} );

		// Disable this step until https://github.com/Automattic/wp-calypso/issues/28974 is solved
		// it( 'Can see correct post tag', async function() {
		// 	const viewPostPage = await ViewPostPage.Expect( driver );
		// 	let tagDisplayed = await viewPostPage.tagDisplayed();
		// 	assert.strictEqual(
		// 		tagDisplayed.toUpperCase(),
		// 		newTagName.toUpperCase(),
		// 		'The tag: ' + newTagName + ' is not being displayed on the post'
		// 	);
		// } );

		after( async function () {
			if ( fileDetails ) {
				await mediaHelper.deleteFile( fileDetails );
			}
			await driverHelper.acceptAlertIfPresent( driver );
		} );
	} );

	describe( 'Basic Public Post @canary @parallel', function () {
		describe( 'Publish a New Post', function () {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'“Whenever you find yourself on the side of the majority, it is time to pause and reflect.”\n- Mark Twain';

			it( 'Can log in', async function () {
				this.loginFlow = new LoginFlow( driver, gutenbergUser );
				return await this.loginFlow.login( { useFreshLogin: true } );
			} );

			it( 'Start new post', async function () {
				const navBarComponent = await NavBarComponent.Expect( driver );
				await navBarComponent.clickMySites();
				const sidebarComponent = await SidebarComponent.Expect( driver );
				await sidebarComponent.selectPosts();
				const postsPage = await PostsPage.Expect( driver );
				return await postsPage.addNewPost();
			} );

			it( 'Can enter post title and text content', async function () {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.initEditor();
				await gEditorComponent.enterTitle( blogPostTitle );
				await gEditorComponent.enterText( blogPostQuote );
			} );

			it( 'Can publish and view content', async function () {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.publish( { visit: true } );
			} );

			it( 'Can see correct post title', async function () {
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

	describe( 'Schedule Basic Public Post @parallel', function () {
		describe( 'Schedule (and remove) a New Post', function () {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote = '“Worries shared are worries halved.”\n- Unknown';

			it( 'Can log in', async function () {
				this.loginFlow = new LoginFlow( driver, gutenbergUser );
				return await this.loginFlow.loginAndStartNewPost( null, true );
			} );

			it( 'Can enter post title and content', async function () {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.enterTitle( blogPostTitle );
				await gEditorComponent.enterText( blogPostQuote );
			} );

			it( 'Can schedule content for a future date and see correct publish date', async function () {
				const gSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
				await gSidebarComponent.displayComponentIfNecessary();
				await gSidebarComponent.chooseDocumentSettings();
				const publishDate = await gSidebarComponent.scheduleFuturePost();

				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				return await gEditorComponent.schedulePost( publishDate );
			} );

			it( 'Remove scheduled post', async function () {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.closeScheduledPanel();
				const gSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
				await gSidebarComponent.selectDocumentTab();
				await gSidebarComponent.trashPost();
			} );

			it( 'Can then see the Posts page with a confirmation message', async function () {
				const noticesComponent = await NoticesComponent.Expect( driver );
				const displayed = await noticesComponent.isSuccessNoticeDisplayed();
				return assert.strictEqual(
					displayed,
					true,
					'The Posts page success notice for deleting the post is not displayed'
				);
			} );

			after( async function () {
				await driverHelper.acceptAlertIfPresent( driver );
			} );
		} );
	} );

	describe( 'Private Posts: @parallel', function () {
		describe( 'Publish a Private Post', function () {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'If you’re not prepared to be wrong; you’ll never come up with anything original.\n— Sir Ken Robinson';

			it( 'Can log in', async function () {
				this.loginFlow = new LoginFlow( driver, gutenbergUser );
				return await this.loginFlow.loginAndStartNewPost( null, true );
			} );

			it( 'Can enter post title and content', async function () {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.enterTitle( blogPostTitle );
				return await gEditorComponent.enterText( blogPostQuote );
				// Temporarily disable ensureSaved() to prevent error:
				// "Timed out waiting for element with css selector of 'span.is-saved' to be present and displayed"
				// return await gEditorComponent.ensureSaved();
			} );

			it( 'Can disable sharing buttons', async function () {
				return await SlackNotifier.warn(
					'Sharing buttons not currently available for Gutenberg in Calypso'
				);
				//let postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
				//await postEditorSidebarComponent.expandSharingSection();
				//await postEditorSidebarComponent.setSharingButtons( false );
				//await postEditorSidebarComponent.closeSharingSection();
			} );

			it( 'Can allow comments', async function () {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.openSidebar();
				const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
				await gEditorSidebarComponent.selectDocumentTab();
				await gEditorSidebarComponent.collapseStatusAndVisibility(); // Status and visibility starts opened
				await gEditorSidebarComponent.expandDiscussion();
				return await gEditorSidebarComponent.setCommentsPreference( { allow: true } );
			} );

			it( 'Set to private which publishes it - Can set visibility to private which immediately publishes it', async function () {
				const gSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
				await gSidebarComponent.chooseDocumentSettings();
				await gSidebarComponent.expandStatusAndVisibility();
				await gSidebarComponent.setVisibilityToPrivate();
				return await gSidebarComponent.hideComponentIfNecessary();
			} );

			it( 'Can view content', async function () {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				return await gEditorComponent.viewPublishedPostOrPage();
			} );

			it( 'As a logged in user - Can see correct post title', async function () {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const postTitle = await viewPostPage.postTitle();
				assert.strictEqual(
					postTitle.toLowerCase(),
					'private: ' + blogPostTitle.toLowerCase(),
					'The published blog post title is not correct'
				);
			} );

			it( 'Can see correct post content', async function () {
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

			it( 'Can see comments enabled', async function () {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const visible = await viewPostPage.commentsVisible();
				assert.strictEqual(
					visible,
					true,
					'Comments are not shown even though they were enabled when creating the post.'
				);
			} );

			it( "Can't see sharing buttons", async function () {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const visible = await viewPostPage.sharingButtonsVisible();
				assert.strictEqual(
					visible,
					false,
					'Sharing buttons are shown even though they were disabled when creating the post.'
				);
			} );

			it( 'Ensure we are not logggd in', async function () {
				await driverManager.clearCookiesAndDeleteLocalStorage( driver );
				await driver.navigate().refresh();
			} );

			it( "As a non-logged in user - Can't see post at all", async function () {
				const notFoundPage = await NotFoundPage.Expect( driver );
				const displayed = await notFoundPage.displayed();
				assert.strictEqual(
					displayed,
					true,
					'Could not see the not found (404) page. Check that it is displayed'
				);
			} );

			after( async function () {
				await driverHelper.acceptAlertIfPresent( driver );
			} );
		} );
	} );

	describe( 'Password Protected Posts: @parallel', function () {
		describe( 'Publish a Password Protected Post', function () {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'The best thing about the future is that it comes only one day at a time.\n— Abraham Lincoln';
			const postPassword = 'e2e' + new Date().getTime().toString();

			it( 'Can log in', async function () {
				const loginFlow = new LoginFlow( driver, gutenbergUser );
				await loginFlow.loginAndStartNewPost( null, true );
			} );

			it( 'Can enter post title and content and set to password protected', async function () {
				let gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.enterTitle( blogPostTitle );

				const gSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
				await gSidebarComponent.chooseDocumentSettings();
				await gSidebarComponent.setVisibilityToPasswordProtected( postPassword );
				await gSidebarComponent.hideComponentIfNecessary();

				gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				return await gEditorComponent.enterText( blogPostQuote );
			} );

			it( 'Can publish and view content', async function () {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.publish( { visit: true } );
			} );
			it( 'As a logged in user, With no password entered, Can view page title', async function () {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const actualPostTitle = await viewPostPage.postTitle();
				assert.strictEqual(
					actualPostTitle.toUpperCase(),
					( 'Protected: ' + blogPostTitle ).toUpperCase()
				);
			} );

			it( 'Can see password field', async function () {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const isPasswordProtected = await viewPostPage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					true,
					'The post does not appear to be password protected'
				);
			} );

			it( "Can't see content when no password is entered", async function () {
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

			it( 'With incorrect password entered, Enter incorrect password', async function () {
				const viewPostPage = await ViewPostPage.Expect( driver );
				await viewPostPage.enterPassword( 'password' );
			} );

			it( 'Can view post title', async function () {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const actualPostTitle = await viewPostPage.postTitle();
				assert.strictEqual(
					actualPostTitle.toUpperCase(),
					( 'Protected: ' + blogPostTitle ).toUpperCase()
				);
			} );

			it( 'Can see password field', async function () {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const isPasswordProtected = await viewPostPage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					true,
					'The post does not appear to be password protected'
				);
			} );

			it( "Can't see content when incorrect password is entered", async function () {
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

			it( 'With correct password entered, Enter correct password', async function () {
				const viewPostPage = await ViewPostPage.Expect( driver );
				await viewPostPage.enterPassword( postPassword );
			} );

			it( 'Can view post title', async function () {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const actualPostTitle = await viewPostPage.postTitle();
				assert.strictEqual(
					actualPostTitle.toUpperCase(),
					( 'Protected: ' + blogPostTitle ).toUpperCase()
				);
			} );

			it( "Can't see password field", async function () {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const isPasswordProtected = await viewPostPage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					false,
					'The post still seems to be password protected'
				);
			} );

			it( 'Can see post content', async function () {
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

			it( 'As a non-logged in user, Clear cookies (log out)', async function () {
				await driver.manage().deleteAllCookies();
				await driver.navigate().refresh();
			} );

			it( 'With no password entered, Can view page title', async function () {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const actualPostTitle = await viewPostPage.postTitle();
				assert.strictEqual(
					actualPostTitle.toUpperCase(),
					( 'Protected: ' + blogPostTitle ).toUpperCase()
				);
			} );

			it( 'Can see password field', async function () {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const isPasswordProtected = await viewPostPage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					true,
					'The post does not appear to be password protected'
				);
			} );

			it( "Can't see content when no password is entered", async function () {
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

			it( 'With incorrect password entered, Enter incorrect password', async function () {
				const viewPostPage = await ViewPostPage.Expect( driver );
				await viewPostPage.enterPassword( 'password' );
			} );

			it( 'Can view post title', async function () {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const actualPostTitle = await viewPostPage.postTitle();
				assert.strictEqual(
					actualPostTitle.toUpperCase(),
					( 'Protected: ' + blogPostTitle ).toUpperCase()
				);
			} );

			it( 'Can see password field', async function () {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const isPasswordProtected = await viewPostPage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					true,
					'The post does not appear to be password protected'
				);
			} );

			it( "Can't see content when incorrect password is entered", async function () {
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

			it( 'With correct password entered, Enter correct password', async function () {
				const viewPostPage = await ViewPostPage.Expect( driver );
				await viewPostPage.enterPassword( postPassword );
			} );

			it( 'Can view post title', async function () {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const actualPostTitle = await viewPostPage.postTitle();
				assert.strictEqual(
					actualPostTitle.toUpperCase(),
					( 'Protected: ' + blogPostTitle ).toUpperCase()
				);
			} );

			it( "Can't see password field", async function () {
				const viewPostPage = await ViewPostPage.Expect( driver );
				const isPasswordProtected = await viewPostPage.isPasswordProtected();
				assert.strictEqual(
					isPasswordProtected,
					false,
					'The page still seems to be password protected'
				);
			} );

			it( 'Can see page content', async function () {
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

			after( async function () {
				await driverHelper.acceptAlertIfPresent( driver );
			} );
		} );
	} );

	describe( 'Trash Post: @parallel', function () {
		describe( 'Trash a New Post', function () {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'The only victory that counts is the victory over yourself.\n— Jesse Owens\n';

			it( 'Can log in', async function () {
				const loginFlow = new LoginFlow( driver, gutenbergUser );
				return await loginFlow.loginAndStartNewPost( null, true );
			} );

			it( 'Can enter post title and content', async function () {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.enterTitle( blogPostTitle );
				await gEditorComponent.enterText( blogPostQuote );
				return gEditorComponent.ensureSaved();
			} );

			it( 'Can trash the new post', async function () {
				const gSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
				await gSidebarComponent.chooseDocumentSettings();
				return await gSidebarComponent.trashPost();
			} );

			it( 'Can then see the Posts page with a confirmation message', async function () {
				const noticesComponent = await NoticesComponent.Expect( driver );
				const displayed = await noticesComponent.isSuccessNoticeDisplayed();
				return assert.strictEqual(
					displayed,
					true,
					'The Posts page success notice for deleting the post is not displayed'
				);
			} );

			after( async function () {
				await driverHelper.acceptAlertIfPresent( driver );
			} );
		} );
	} );

	describe( 'Edit a Post: @parallel', function () {
		describe( 'Publish a New Post', function () {
			const originalBlogPostTitle = dataHelper.randomPhrase();
			const updatedBlogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'Science is organised knowledge. Wisdom is organised life..\n~ Immanuel Kant';

			it( 'Can log in', async function () {
				const loginFlow = new LoginFlow( driver, gutenbergUser );
				return await loginFlow.loginAndStartNewPost( null, true );
			} );

			it( 'Can enter post title and content', async function () {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.enterTitle( originalBlogPostTitle );
				await gEditorComponent.enterText( blogPostQuote );
			} );

			it( 'Can publish the post', async function () {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.publish( { visit: true } );
			} );

			describe( 'Edit the post via posts', function () {
				it( 'Can view the posts list', async function () {
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

				it( 'Can see and edit our new post', async function () {
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

				it( 'Can see the post title', async function () {
					const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
					const titleShown = await gEditorComponent.titleShown();
					assert.strictEqual(
						titleShown,
						originalBlogPostTitle,
						'The blog post title shown was unexpected'
					);
				} );

				it( 'Can see the Line Height setting for the paragraph', async function () {
					const gSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );

					if ( driverManager.currentScreenSize() === 'mobile' )
						await gSidebarComponent.hideComponentIfNecessary();

					// Give focus to the first paragraph block found
					await driverHelper.clickWhenClickable(
						driver,
						By.css( 'p.block-editor-rich-text__editable:first-of-type' )
					);

					await gSidebarComponent.displayComponentIfNecessary();
					await gSidebarComponent.chooseBlockSettings();

					const lineHeighSettingPresent = await driverHelper.isElementLocated(
						driver,
						By.css( '.block-editor-line-height-control' )
					);

					if ( driverManager.currentScreenSize() === 'mobile' )
						await gSidebarComponent.hideComponentIfNecessary();

					assert.ok( lineHeighSettingPresent, 'Line height setting not found' );
				} );

				it( 'Can set the new title and update it, and link to the updated post', async function () {
					const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
					await gEditorComponent.enterTitle( updatedBlogPostTitle );

					return await gEditorComponent.update( { visit: true } );
				} );

				describe( 'Can view the post with the new title', function () {
					it( 'Can view the post', async function () {
						return await ViewPostPage.Expect( driver );
					} );

					it( 'Can see correct post title', async function () {
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

		after( async function () {
			await driverHelper.acceptAlertIfPresent( driver );
		} );
	} );

	describe( 'Insert a contact form: @parallel', function () {
		describe( 'Publish a New Post with a Contact Form', function () {
			const originalBlogPostTitle = 'Contact Us: ' + dataHelper.randomPhrase();
			const contactEmail = 'testing@automattic.com';
			const subject = "Let's work together";

			it( 'Can log in', async function () {
				const loginFlow = new LoginFlow( driver, gutenbergUser );
				return await loginFlow.loginAndStartNewPost( null, true );
			} );

			it( 'Can insert the contact form', async function () {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.enterTitle( originalBlogPostTitle );
				await gEditorComponent.insertContactForm( contactEmail, subject );
				await gEditorComponent.ensureSaved();

				const contactFormDisplayedInEditor = await gEditorComponent.contactFormDisplayedInEditor();
				assert.strictEqual(
					contactFormDisplayedInEditor,
					true,
					'The contact form is not displayed in the editor'
				);
			} );

			it( 'Can publish and view content', async function () {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.publish( { visit: true } );
			} );

			it( 'Can see the contact form in our published post', async function () {
				this.viewPostPage = await ViewPostPage.Expect( driver );
				const displayed = await this.viewPostPage.contactFormDisplayed();
				assert.strictEqual(
					displayed,
					true,
					'The published post does not contain the contact form'
				);
			} );

			after( async function () {
				await driverHelper.acceptAlertIfPresent( driver );
			} );
		} );
	} );

	describe( 'Insert a payment button: @parallel', function () {
		const paymentButtonDetails = {
			title: 'Button',
			description: 'Description',
			symbol: '$',
			price: '1.99',
			currency: 'USD',
			allowQuantity: true,
			email: 'test@wordpress.com',
		};

		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can insert the payment button', async function () {
			const blogPostTitle = 'Payment Button: ' + dataHelper.randomPhrase();
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			const blockId = await gEditorComponent.addBlock( 'Pay with PayPal' );

			const gPaymentComponent = await SimplePaymentsBlockComponent.Expect( driver, blockId );
			await gPaymentComponent.insertPaymentButtonDetails( paymentButtonDetails );

			await gEditorComponent.enterTitle( blogPostTitle );
			await gEditorComponent.ensureSaved();
			return await gPaymentComponent.ensurePaymentButtonDisplayedInEditor();
		} );

		it( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			try {
				await gEditorComponent.publish( { visit: true } );
			} catch {
				/**
				 * Publish panel is forcibly dismissed after publishing post with a
				 * Payment button. For some reason Gutenberg detects a change to the
				 * content so we need to update it and then visit the published page.
				 *
				 * This fallback should be removed once the following is resolved:
				 *
				 * @see {@link https://github.com/Automattic/wp-calypso/issues/50302}
				 */
				await gEditorComponent.update( { visit: true } );
			}
		} );

		it( 'Can see the payment button in our published post', async function () {
			const viewPostPage = await ViewPostPage.Expect( driver );
			const displayed = await viewPostPage.paymentButtonDisplayed();
			return assert.strictEqual(
				displayed,
				true,
				'The published post does not contain the payment button'
			);
		} );

		it( 'The payment button in our published post opens a new Paypal window for payment', async function () {
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
		} );

		after( async function () {
			await driverHelper.acceptAlertIfPresent( driver );
			await driverHelper.ensurePopupsClosed( driver );
		} );
	} );

	describe( 'Use the Calypso Media Modal: @parallel', function () {
		let fileDetails;

		// Create image file for upload
		before( async function () {
			fileDetails = await mediaHelper.createFile();
			return fileDetails;
		} );

		it( 'Can log in', async function () {
			const loginFlow = new LoginFlow( driver, gutenbergUser );
			return await loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can insert an image in an Image block with the Media Modal', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.addImageFromMediaModal( fileDetails );
		} );
	} );

	describe( 'Revert a post to draft: @parallel', function () {
		describe( 'Publish a new post', function () {
			const originalBlogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'To really be of help to others we need to be guided by compassion.\n— Dalai Lama';

			it( 'Can log in', async function () {
				const loginFlow = new LoginFlow( driver, gutenbergUser );
				return await loginFlow.loginAndStartNewPost( null, true );
			} );

			it( 'Can enter post title and content', async function () {
				const gHeaderComponent = await GutenbergEditorComponent.Expect( driver );
				await gHeaderComponent.enterTitle( originalBlogPostTitle );
				await gHeaderComponent.enterText( blogPostQuote );
			} );

			it( 'Can publish the post', async function () {
				const gHeaderComponent = await GutenbergEditorComponent.Expect( driver );
				return await gHeaderComponent.publish();
			} );
		} );

		describe( 'Revert the post to draft', function () {
			it( 'Can revert the post to draft', async function () {
				const gHeaderComponent = await GutenbergEditorComponent.Expect( driver );
				await gHeaderComponent.dismissSuccessNotice();
				await gHeaderComponent.revertToDraft();
			} );
		} );

		after( async function () {
			await driverHelper.acceptAlertIfPresent( driver );
		} );
	} );

	describe( 'Insert embeds: @parallel', function () {
		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can start post', async function () {
			const blogPostTitle = 'Embeds: ' + dataHelper.randomPhrase();
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.enterTitle( blogPostTitle );
			const title = await gEditorComponent.titleShown();
			assert.strictEqual( title, blogPostTitle );
		} );

		[
			{
				name: 'Instagram',
				url: 'https://www.instagram.com/p/BlDOZMil933/',
				selector: '.wp-block-embed iframe[title="Embedded content from instagram.com"]',
			},
			{
				name: 'Twitter',
				url: 'https://twitter.com/automattic/status/1067120832676327424',
				selector: '.wp-block-embed iframe[title="Embedded content from twitter"]',
			},
			{
				name: 'YouTube',
				url: 'https://www.youtube.com/watch?v=xifhQyopjZM',
				selector: '.wp-block-embed iframe[title="Embedded content from youtube.com"]',
			},
		].forEach( ( Block ) => {
			it( `Can insert ${ Block.name } block`, async function () {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				const embedBlock = await gEditorComponent.addBlock( Block.name );
				const gEmbedsComponent = await EmbedsBlockComponent.Expect( driver, embedBlock );
				await gEmbedsComponent.embedUrl( Block.url );
				await gEmbedsComponent.isEmbeddedInEditor( Block.selector );
			} );
		} );

		it( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		it( 'Can see embedded content in our published post', async function () {
			const viewPostPage = await ViewPostPage.Expect( driver );
			this.youtubePostLocator = '.youtube-player';
			await viewPostPage.embedContentDisplayed( this.youtubePostLocator ); // check YouTube content
			this.instagramPostLocator = '.instagram-media-rendered';
			await viewPostPage.embedContentDisplayed( this.instagramPostLocator ); // check Instagram content
			this.instagramPostLocator = '.twitter-tweet-rendered';
			return await viewPostPage.embedContentDisplayed( this.instagramPostLocator ); // check Twitter content
		} );

		after( async function () {
			await driverHelper.acceptAlertIfPresent( driver );
		} );
	} );

	describe( 'Can Share Posts From Reader (PressThis)! @parallel', function () {
		it( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			await this.loginFlow.login();
			return await this.loginFlow.checkForDevDocsAndRedirectToReader();
		} );

		it( 'Find a post to share (press this)', async function () {
			const readerPage = await ReaderPage.Expect( driver );
			const sharePostError = await readerPage.shareLatestPost();
			if ( sharePostError instanceof Error ) {
				throw sharePostError;
			}
		} );

		it( 'Block Editor loads with shared content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.initEditor();
		} );

		it( 'Can publish and view content', async function () {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			return await gEditorComponent.publish( { visit: true } );
		} );

		it( 'Can see a post title and post content', async function () {
			const viewPostPage = await ViewPostPage.Expect( driver );
			const postTitle = await viewPostPage.postTitle();
			const postContent = await viewPostPage.postContent();
			assert( postTitle.length > 0, 'Press This did not copy a post title!' );
			return assert( postContent.length > 0, 'Press This did not copy any post content!' );
		} );
	} );

	describe( 'Use the Calypso revisions modal @parallel', function () {
		const originalTitle = dataHelper.randomPhrase();
		const updatedTitle = dataHelper.randomPhrase();
		const originalContent = 'Details matter, it’s worth waiting to get it right. ~ Steve Jobs';
		const updatedContent =
			'Your most unhappy customers are your greatest source of learning. ~ Bill Gates';

		it( 'Can log in', async function () {
			const loginFlow = new LoginFlow( driver, gutenbergUser );
			await loginFlow.loginAndStartNewPost( null, true );
		} );

		it( 'Can enter post title and text content', async function () {
			const editor = await GutenbergEditorComponent.Expect( driver );
			await editor.enterTitle( originalTitle );
			await editor.enterText( originalContent );
			await editor.ensureSaved();
		} );

		it( 'Can update post title and text content', async function () {
			const editor = await GutenbergEditorComponent.Expect( driver );
			await editor.enterTitle( updatedTitle );
			await editor.replaceTextOnLastParagraph( updatedContent );
			await editor.ensureSaved();
		} );

		it( 'Can open the revisions modal', async function () {
			const editor = await GutenbergEditorComponent.Expect( driver );
			await editor.openSidebar();
			const sidebar = await GutenbergEditorSidebarComponent.Expect( driver );
			await sidebar.selectDocumentTab();
			await sidebar.openRevisionsDialog();
		} );

		it( 'Can restore the previous revision', async function () {
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
