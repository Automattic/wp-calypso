/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container';

export default class NotificationsComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#wp-admin-bar-notes #wpnt-notes-panel2' ) );
		this.undoSelector = by.css( '.wpnc__undo-item' );
	}

	async _preInit() {
		// Ensure we're starting from the top frame before expecting on this.expectedElementSelector
		await this.driver.switchTo().defaultContent();
	}

	async selectComments() {
		await driverHelper.waitUntilAbleToSwitchToFrame( this.driver, this.expectedElementSelector );
		await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'li[data-filter-name="comments"]' )
		);
		return await driverHelper.waitUntilLocatedAndVisible(
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

		await this.driver.sleep( 400 ); // Wait for menu animation to complete
		await driverHelper.clickWhenClickable( this.driver, trashPostLocator );
	}

	async waitForUndoMessage() {
		return await driverHelper.waitUntilLocatedAndVisible( this.driver, this.undoSelector );
	}

	async waitForUndoMessageToDisappear() {
		return await driverHelper.waitTillNotPresent( this.driver, this.undoSelector );
	}
}
