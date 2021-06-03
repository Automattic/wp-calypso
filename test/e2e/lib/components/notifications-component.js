/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container';

export default class NotificationsComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#wpnc-panel' ) );
		this.undoLocator = By.css( '.wpnc__undo-item' );
	}

	async selectComments() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'li[data-filter-name="comments"]' )
		);
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( 'li.wpnc__comment' )
		);
	}

	async allCommentsContent() {
		const element = await this.driver.findElement( By.css( '.wpnc__notes' ) );
		return await element.getText();
	}

	async selectCommentByText( commentText ) {
		const commentLocator = driverHelper.createTextLocator(
			By.css( '.wpnc__excerpt' ),
			commentText
		);
		return await driverHelper.clickWhenClickable( this.driver, commentLocator );
	}

	async trashComment() {
		const trashPostLocator = By.css( 'button[title="Trash comment"]' );

		await driverHelper.clickWhenClickable( this.driver, trashPostLocator );
	}

	async waitForUndoMessage() {
		return await driverHelper.waitUntilElementLocatedAndVisible( this.driver, this.undoLocator );
	}

	async waitForUndoMessageToDisappear() {
		return await driverHelper.waitUntilElementNotLocated( this.driver, this.undoLocator );
	}
}
