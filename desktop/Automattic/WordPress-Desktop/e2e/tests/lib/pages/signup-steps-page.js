/* eslint-disable jsdoc/check-tag-names */
/** @format */

const { By } = require( 'selenium-webdriver' );
const AsyncBaseContainer = require( '../async-base-container' );
const driverHelper = require( '../driver-helper' );

class SignupStepsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.signup__steps' ) );
	}

	async aboutSite() {
		const siteNameForm = By.css( '#siteTitle' );
		const siteName = 'e2eflowtesting desktop app';

		const siteTopicForm = By.css( '#siteTopic' );
		const aboutSite = 'about e2eflowtesting desktop app';

		const shareCheckbox = By.css( '#share' );
		const comfortableScale = By.css( '.segmented-control__text' );
		const submitButton = By.css( '.about__submit-wrapper .is-primary' );

		await driverHelper.setWhenSettable( this.driver, siteNameForm, siteName );
		await driverHelper.setWhenSettable( this.driver, siteTopicForm, aboutSite );

		await driverHelper.clickWhenClickable( this.driver, shareCheckbox );
		await driverHelper.selectElementByText( this.driver, comfortableScale, '3' );

		return await driverHelper.clickWhenClickable( this.driver, submitButton );
	}

	async selectTheme() {
		const themeSelector = By.css( '.theme' );

		await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.is-themes' ) );
		await driverHelper.clickWhenClickable( this.driver, themeSelector );
	}

	async selectDomain( domainName ) {
		const searchDomainField = By.css( '.search-component__input' );

		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.register-domain-step__search' )
		);
		await driverHelper.setWhenSettable( this.driver, searchDomainField, domainName );
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.domain-suggestion__content' )
		);

		return await this.selectFreeAddress();
	}

	async selectFreeAddress() {
		await driverHelper.scrollIntoView( this.driver, By.css( '.domain-suggestion' ) );
		return await driverHelper.selectElementByText(
			this.driver,
			By.css( '.domain-product-price__price' ),
			'Free'
		);
	}

	async selectPlan( plan ) {
		// plan should be 'free', 'personal', 'premium', 'business' or 'ecommerce'
		let planButton;
		const plansPage = By.css( '.is-plans' );

		if ( plan === 'free' ) {
			planButton = By.css( `.is-${ plan }-plan` );
		} else {
			planButton = By.css( `.plan-features__actions-button.is-${ plan }-plan` );
		}

		await driverHelper.waitTillPresentAndDisplayed( this.driver, plansPage );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, planButton );
		return await driverHelper.clickWhenClickable( this.driver, planButton );
	}

	async enterAccountDetailsAndSubmit( email, username, password ) {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.signup-form' ) );

		await driverHelper.setWhenSettable( this.driver, By.css( '#email' ), email );
		await driverHelper.setWhenSettable( this.driver, By.css( '#username' ), username );
		await driverHelper.setWhenSettable( this.driver, By.css( '#password' ), password, {
			secureValue: true,
		} );

		await driverHelper.clickWhenClickable( this.driver, By.css( 'button.signup-form__submit' ) );

		return await this.driver.sleep( 5000 );
	}
}

module.exports = SignupStepsPage;
