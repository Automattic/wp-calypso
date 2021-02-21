/**
 * External dependencies
 */
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';

import ReaderPage from '../lib/pages/reader-page.js';

import NavBarComponent from '../lib/components/nav-bar-component.js';
import NotificationsComponent from '../lib/components/notifications-component.js';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( 'Reader: (' + screenSize + ') @parallel', function () {
	this.timeout( mochaTimeOut );
	describe( 'Log in as commenting user', function () {
		step( 'Can log in as commenting user', async function () {
			this.loginFlow = new LoginFlow( driver, 'commentingUser' );
			return await this.loginFlow.login( { useFreshLogin: true } );
		} );

		describe( 'Leave a comment on the latest post in the Reader', function () {
			step( 'Can see the Reader stream', async function () {
				await ReaderPage.Expect( driver );
			} );

			step( 'The latest post is on the expected test site', async function () {
				const testSiteForNotifications = dataHelper.configGet( 'testSiteForNotifications' );
				const readerPage = await ReaderPage.Expect( driver );
				const siteOfLatestPost = await readerPage.siteOfLatestPost();
				return assert.strictEqual(
					siteOfLatestPost,
					testSiteForNotifications,
					'The latest post is not on the expected test site'
				);
			} );

			step( 'Can comment on the latest post and see the comment appear', async function () {
				this.comment = dataHelper.randomPhrase();
				const readerPage = await ReaderPage.Expect( driver );
				await readerPage.commentOnLatestPost( this.comment );
				await readerPage.waitForCommentToAppear( this.comment );
			} );

			describe( 'Delete the new comment', function () {
				step( 'Can log in as test site owner', async function () {
					this.loginFlow = new LoginFlow( driver, 'notificationsUser' );
					return await this.loginFlow.login();
				} );

				step(
					'Can delete the new comment (and wait for UNDO grace period so step is actually deleted)',
					async function () {
						this.navBarComponent = await NavBarComponent.Expect( driver );
						await this.navBarComponent.openNotifications();
						this.notificationsComponent = await NotificationsComponent.Expect( driver );
						await this.notificationsComponent.selectCommentByText( this.comment );
						await this.notificationsComponent.trashComment();
						await this.notificationsComponent.waitForUndoMessage();
						return await this.notificationsComponent.waitForUndoMessageToDisappear();
					}
				);
			} );
		} );
	} );
} );
