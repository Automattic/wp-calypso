/* eslint-disable jsdoc/check-tag-names */
/** @format */

const { By } = require( 'selenium-webdriver' );
const AsyncBaseContainer = require( '../async-base-container' );
const driverHelper = require( '../driver-helper' );

class LoginPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.is-section-auth' ) );
	}

	async login( username, password ) {
		const driver = this.driver;
		const userNameSelector = By.name( 'login' );
		const passwordSelector = By.name( 'password' );
		const submitSelector = By.css( 'button.is-primary' );

		await this.hideGdprBanner();

		await driverHelper.waitTillPresentAndDisplayed( driver, userNameSelector );
		await driverHelper.setWhenSettable( driver, userNameSelector, username );

		await driverHelper.setWhenSettable( driver, passwordSelector, password, {
			secureValue: true,
		} );
		await driverHelper.clickWhenClickable( driver, submitSelector );
		return await driver.sleep( 1000 );
	}

	async hideGdprBanner() {
		const gdprBannerButton = By.css( '.gdpr-banner__acknowledge-button' );
		try {
			await driverHelper.waitTillPresentAndDisplayed( this.driver, gdprBannerButton, 3000 );
			await driverHelper.clickWhenClickable( this.driver, gdprBannerButton );
			return await driverHelper.waitTillNotPresent( this.driver, gdprBannerButton, 3000 );
		} catch ( e ) {
			console.log( 'GDPR button is not present.' ); // eslint-disable-line no-console
			return true;
		}
	}

	async openCreateAccountPage() {
		const element = By.css( '.auth__links a' );
		await driverHelper.isEventuallyPresentAndDisplayed( this.driver, element );
		return await driverHelper.clickWhenClickable( this.driver, element );
	}
}

module.exports = LoginPage;
