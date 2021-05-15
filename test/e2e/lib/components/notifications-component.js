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
		super( driver, by.css( '#wpnc-panel' ) );
		this.undoLocator = by.css( '.wpnc__undo-item' );
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
		const commentLocator = by.css( '.wpnc__excerpt' );
		return await driverHelper.selectElementByText( this.driver, commentLocator, commentText );
	}

	async trashComment() {
		const trashPostLocator = by.css( 'button[title="Trash comment"]' );

		await driverHelper.clickWhenClickable( this.driver, trashPostLocator );
	}

	async waitForUndoMessage() {
		return await driverHelper.waitUntilElementLocatedAndVisible( this.driver, this.undoLocator );
	}

	async waitForUndoMessageToDisappear() {
		return await driverHelper.waitUntilElementNotLocated( this.driver, this.undoLocator );
	}
}
