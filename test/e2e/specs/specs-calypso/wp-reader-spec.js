/**
 * External dependencies
 */
import config from 'config';
import assert from 'assert';

/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';

import ReaderPage from '../../lib/pages/reader-page.js';

import NavBarComponent from '../../lib/components/nav-bar-component.js';
import NotificationsComponent from '../../lib/components/notifications-component.js';

import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

describe( 'Reader: (' + screenSize + ') @parallel', function () {
	this.timeout( mochaTimeOut );

	it( 'Can log in as commenting user', async function () {
		this.loginFlow = new LoginFlow( this.driver, 'commentingUser' );
		return await this.loginFlow.login( { useFreshLogin: true } );
	} );

	it( 'Can see the Reader stream', async function () {
		await ReaderPage.Expect( this.driver );
	} );

	it( 'The latest post is on the expected test site', async function () {
		const testSiteForNotifications = dataHelper.configGet( 'testSiteForNotifications' );
		const readerPage = await ReaderPage.Expect( this.driver );
		const siteOfLatestPost = await readerPage.siteOfLatestPost();
		return assert.strictEqual(
			siteOfLatestPost,
			testSiteForNotifications,
			'The latest post is not on the expected test site'
		);
	} );

	it( 'Can comment on the latest post and see the comment appear', async function () {
		this.comment = dataHelper.randomPhrase();
		const readerPage = await ReaderPage.Expect( this.driver );
		await readerPage.commentOnLatestPost( this.comment );
		await readerPage.waitForCommentToAppear( this.comment );
	} );

	it( 'Can log in as test site owner', async function () {
		this.loginFlow = new LoginFlow( this.driver, 'notificationsUser' );
		return await this.loginFlow.login();
	} );

	it( 'Can delete the new comment (and wait for UNDO grace period so step is actually deleted)', async function () {
		this.navBarComponent = await NavBarComponent.Expect( this.driver );
		await this.navBarComponent.openNotifications();
		this.notificationsComponent = await NotificationsComponent.Expect( this.driver );
		await this.notificationsComponent.selectCommentByText( this.comment );
		await this.notificationsComponent.trashComment();
		await this.notificationsComponent.waitForUndoMessage();
		return await this.notificationsComponent.waitForUndoMessageToDisappear();
	} );
} );
