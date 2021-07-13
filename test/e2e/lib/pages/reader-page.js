import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import * as dataHelper from '../data-helper';
import * as driverHelper from '../driver-helper.js';

export default class ReaderPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			url = ReaderPage.getReaderURL();
		}
		super( driver, By.css( '.is-section-reader' ), url );
	}

	async siteOfLatestPost() {
		const href = await this.driver
			.findElement( By.css( '.reader-visit-link' ) )
			.getAttribute( 'href' );
		return new URL( href ).host;
	}

	async shareLatestPost() {
		const shareButtonLocator = By.css( '.reader-share__button' );

		// Allow the components to settle and finish loading, one hopes. There
		// continues to be errors where the test cannot find the site selector
		// below after opening the reader share button. The screencasts indicate
		// that more posts are added to the page after the share modal opens,
		// causing the share modal to close before it clicks the site button.
		await this.driver.sleep( 2000 );

		const hasSharablePost = await driverHelper.isElementLocated( this.driver, shareButtonLocator );
		if ( ! hasSharablePost ) {
			// no shareable posts on this screen. try moving into a combined card
			const firstComboCardPostLocator = By.css( '.reader-combined-card__post-title-link' );
			await driverHelper.clickWhenClickable( this.driver, firstComboCardPostLocator );
		}

		async function clickAndOpenShareModal( driver ) {
			await driverHelper.clickWhenClickable( driver, shareButtonLocator );
			return await driverHelper.clickWhenClickable(
				driver,
				By.css( '.site-selector__sites .site__content' )
			);
		}

		// Try a second time if the share menu is closed during the operation
		// the first time.
		let result;
		try {
			result = await clickAndOpenShareModal( this.driver );
		} catch {
			result = await clickAndOpenShareModal( this.driver );
		}
		return result;
	}

	async commentOnLatestPost( comment ) {
		await driverHelper.clickWhenClickable( this.driver, By.css( '.comment-button' ) );
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.comments__form textarea' ),
			comment
		);
		return await driverHelper.clickWhenClickable( this.driver, By.css( '.comments__form button' ) );
	}

	async waitForCommentToAppear( comment ) {
		const commentLocator = driverHelper.createTextLocator(
			By.css( '.comments__comment-content' ),
			comment
		);
		return await driverHelper.waitUntilElementLocatedAndVisible( this.driver, commentLocator );
	}

	static getReaderURL() {
		return dataHelper.getCalypsoURL( 'read' );
	}
}
