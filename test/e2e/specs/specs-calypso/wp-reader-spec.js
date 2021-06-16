/**
 * External dependencies
 */
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

const screenSize = driverManager.currentScreenSize();

describe( 'Reader: (' + screenSize + ') @parallel', function () {
	let driver;
	let loginFlow;
	let comment;
	let navBarComponent;
	let notificationsComponent;

	beforeAll( () => ( driver = global.__BROWSER__ ) );

	it( 'Can log in as commenting user', async function () {
		loginFlow = new LoginFlow( driver, 'commentingUser' );
		return await loginFlow.login( { useFreshLogin: true } );
	} );

	it( 'Can see the Reader stream', async function () {
		await ReaderPage.Expect( driver );
	} );

	it( 'The latest post is on the expected test site', async function () {
		const testSiteForNotifications = dataHelper.configGet( 'testSiteForNotifications' );
		const readerPage = await ReaderPage.Expect( driver );
		const siteOfLatestPost = await readerPage.siteOfLatestPost();
		return assert.strictEqual(
			siteOfLatestPost,
			testSiteForNotifications,
			'The latest post is not on the expected test site'
		);
	} );

	it( 'Can comment on the latest post and see the comment appear', async function () {
		comment = dataHelper.randomPhrase();
		const readerPage = await ReaderPage.Expect( driver );
		await readerPage.commentOnLatestPost( comment );
		await readerPage.waitForCommentToAppear( comment );
	} );

	it( 'Can log in as test site owner', async function () {
		loginFlow = new LoginFlow( driver, 'notificationsUser' );
		return await loginFlow.login();
	} );

	it( 'Can delete the new comment (and wait for UNDO grace period so step is actually deleted)', async function () {
		navBarComponent = await NavBarComponent.Expect( driver );
		await navBarComponent.openNotifications();
		notificationsComponent = await NotificationsComponent.Expect( driver );
		await notificationsComponent.selectCommentByText( comment );
		await notificationsComponent.trashComment();
		await notificationsComponent.waitForUndoMessage();
		return await notificationsComponent.waitForUndoMessageToDisappear();
	} );
} );
