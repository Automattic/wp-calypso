/**
 * External dependencies
 */
import { By as by, until } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container';

export default class NotificationsComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#wpnc-panel' ) );
		this.undoSelector = by.css( '.wpnc__undo-item' );
	}

	async selectComments() {
		await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'li[data-filter-name="comments"]' )
		);
		return await driverHelper.waitTillPresentAndDisplayed(
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
		const self = this;
		const trashPostSelector = by.css( 'button[title="Trash comment"]' );
		await this.driver.wait(
			until.elementLocated( trashPostSelector ),
			self.explicitWaitMS,
			'Could not locate the trash comment button'
		);
		const trashPostElement = await self.driver.findElement( trashPostSelector );
		await this.driver.wait(
			until.elementIsVisible( trashPostElement ),
			self.explicitWaitMS,
			'The trash post comment is not visible'
		);
		await driverHelper.clickWhenClickable( self.driver, trashPostSelector );
		return self.driver
			.wait( until.elementLocated( by.css( '.wpnc__undo-item' ) ), this.explicitWaitMS )
			.then(
				() => {},
				() => {
					driverHelper.clickWhenClickable( self.driver, trashPostSelector );
				}
			);
	}

	async waitForUndoMessage() {
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, this.undoSelector );
	}

	async waitForUndoMessageToDisappear() {
		return await driverHelper.waitTillNotPresent( this.driver, this.undoSelector );
	}
}
