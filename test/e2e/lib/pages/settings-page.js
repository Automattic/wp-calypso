/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import SectionNavComponent from '../components/section-nav-component';
import DisconnectSurveyPage from './disconnect-survey-page.js';

import * as DriverHelper from '../driver-helper.js';
import NoticesComponent from '../components/notices-component';

export default class SettingsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.site-settings' ) );
	}

	async selectWriting() {
		const sectionNav = await SectionNavComponent.Expect( this.driver );
		sectionNav.ensureMobileMenuOpen();
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*=writing]' )
		);
	}

	async selectPerformance() {
		const sectionNav = await SectionNavComponent.Expect( this.driver );
		sectionNav.ensureMobileMenuOpen();
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*=performance]' )
		);
	}

	async mediaSettingsSectionDisplayed() {
		return await DriverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			By.css( '.site-settings__media-settings' )
		);
	}

	async photonToggleDisplayed() {
		return await DriverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			By.css( '.jetpack-module-toggle .components-form-toggle__input' )
		);
	}

	async carouselToggleDisplayed() {
		return await DriverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			By.css( '.jetpack-module-toggle .components-form-toggle__input' )
		);
	}

	async carouseBackgroundColorDisplayed() {
		return await DriverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			By.css( '#carousel_background_color' )
		);
	}

	async manageConnection() {
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a[href*="manage-connection"]' )
		);
	}

	async disconnectSite() {
		await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.manage-connection__disconnect-link a' )
		);

		const present = await DriverHelper.isElementLocated(
			this.driver,
			By.css( '.is-primary.is-scary' )
		);
		if ( present ) {
			await DriverHelper.clickWhenClickable( this.driver, By.css( '.is-primary.is-scary' ) );
			const noticesComponent = await NoticesComponent.Expect( this.driver );
			return await noticesComponent.isSuccessNoticeDisplayed();
		}
		const surveyPage = await DisconnectSurveyPage.Expect( this.driver );
		return await surveyPage.skipSurveyAndDisconnectSite();
	}

	async deleteSite( siteName ) {
		await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( 'p.site-tools__section-title.is-warning' )
		);
		await DriverHelper.clickWhenClickable( this.driver, By.css( '.is-scary' ) );
		await DriverHelper.setWhenSettable(
			this.driver,
			By.css( '.delete-site__confirm-input' ),
			siteName
		);
		await DriverHelper.clickWhenClickable(
			this.driver,
			By.className( 'button is-primary is-scary' )
		);
		return await DriverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '#notices .is-success' )
		);
	}
}
