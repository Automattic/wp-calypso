/* eslint-disable jsdoc/check-tag-names */
/** @format */

const { By } = require( 'selenium-webdriver' );

const AsyncBaseContainer = require( '../async-base-container' );
const driverHelper = require( '../driver-helper' );

class ViewPostPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.type-post' ) );
	}

	async postTitle() {
		return await this.driver.findElement( By.css( '.entry-title,.post-title' ) ).getText();
	}

	async postContent() {
		return await this.driver.findElement( By.css( '.entry-content,.post-content' ) ).getText();
	}

	async categoryDisplayed() {
		return await this.driver
			.findElement( By.css( 'a[rel="category tag"], a[rel="category"]' ) )
			.getText();
	}

	async tagDisplayed() {
		return await this.driver.findElement( By.css( 'a[rel=tag]' ) ).getText();
	}

	async imageDisplayed( fileDetails ) {
		return await this.driver
			.findElement( By.css( `img[alt='${ fileDetails.imageName }']` ) )
			.then( ( imageElement ) => {
				return driverHelper.imageVisible( this.driver, imageElement );
			} );
	}
}

module.exports = ViewPostPage;
