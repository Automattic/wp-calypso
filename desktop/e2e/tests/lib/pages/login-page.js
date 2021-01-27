/* eslint-disable jsdoc/check-tag-names */
/** @format */

const { By, Key } = require( 'selenium-webdriver' );
const AsyncBaseContainer = require( '../async-base-container' );
const driverHelper = require( '../driver-helper' );

class LoginPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.wp-login__container' ) );
	}

	async login( username, password ) {
		const driver = this.driver;
		const userNameSelector = By.css( '#usernameOrEmail' );
		const passwordSelector = By.css( '#password' );
		const changeAccountSelector = By.css( '#loginAsAnotherUser' );
		const alreadyLoggedInSelector = By.css( '.continue-as-user' );

		const isDisplayed = await driverHelper.isEventuallyPresentAndDisplayed(
			driver,
			alreadyLoggedInSelector,
			2000
		);
		if ( isDisplayed ) {
			await driverHelper.clickWhenClickable( driver, changeAccountSelector );
		}
		await driverHelper.waitTillPresentAndDisplayed( driver, userNameSelector );
		await driverHelper.setWhenSettable( driver, userNameSelector, username );
		await this.driver.sleep( 1000 );
		await driver.findElement( userNameSelector ).sendKeys( Key.ENTER );

		await driverHelper.waitTillPresentAndDisplayed( driver, passwordSelector );
		await driverHelper.waitTillFocused( driver, passwordSelector );
		await driverHelper.setWhenSettable( driver, passwordSelector, password, {
			secureValue: true,
		} );

		await this.driver.sleep( 1000 );
		await driver.findElement( passwordSelector ).sendKeys( Key.ENTER );

		await this.driver.sleep( 1000 );

		return await driverHelper.waitTillNotPresent( driver, userNameSelector );
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
