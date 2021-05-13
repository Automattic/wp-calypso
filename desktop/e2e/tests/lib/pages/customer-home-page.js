const { By } = require( 'selenium-webdriver' );
const AsyncBaseContainer = require( '../async-base-container' );

class CustomerHomePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.is-section-home' ) );
	}
}

module.exports = CustomerHomePage;
