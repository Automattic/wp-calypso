/* eslint-disable jsdoc/check-tag-names */
/** @format */

const { By } = require( 'selenium-webdriver' );
const AsyncBaseContainer = require( '../async-base-container' );

class ReaderPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.is-section-reader' ) );
	}
}

module.exports = ReaderPage;
