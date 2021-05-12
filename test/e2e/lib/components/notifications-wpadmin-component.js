/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container';

export default class NotificationsWPAdminComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#wpnt-notes-panel2' ) );
		this.undoSelector = by.css( '.wpnc__undo-item' );
	}

	async _preInit() {
		await this.driver.switchTo().defaultContent();
	}
	async _postInit() {
		await driverHelper.waitUntilAbleToSwitchToFrame( this.driver, by.css( '#wpnt-notes-iframe2' ) );
	}
	async selectComments() {
		await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'li[data-filter-name="comments"]' )
		);
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			by.css( 'li.wpnc__comment' )
		);
	}

	async allCommentsContent() {
		const element = await this.driver.findElement( by.css( '.wpnc__notes' ) );
		return await element.getText();
	}

	async selectCommentByText( commentText ) {
		const commentSelector = by.css( '.wpnc__excerpt' );
		return await driverHelper.selectElementByText( this.driver, commentSelector, commentText );
	}

	async trashComment() {
		const trashPostLocator = by.css( 'button[title="Trash comment"]' );
		await driverHelper.clickWhenClickable( this.driver, trashPostLocator );
	}

	async waitForUndoMessage() {
		return await driverHelper.waitUntilElementLocatedAndVisible( this.driver, this.undoSelector );
	}

	async waitForUndoMessageToDisappear() {
		return await driverHelper.waitUntilElementNotLocated( this.driver, this.undoSelector );
	}
}
