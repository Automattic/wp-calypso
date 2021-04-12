/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import { By } from 'selenium-webdriver';
import { step } from 'mocha-steps';

/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';
import * as driverHelper from '../lib/driver-helper';
import LoginFlow from '../lib/flows/login-flow.js';
import DeleteSiteFlow from '../lib/flows/delete-site-flow.js';
import GutenboardingFlow from '../lib/flows/gutenboarding-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

const host = dataHelper.getJetpackHost();
const screenSize = driverManager.currentScreenSize();

describe( `[${ host }] Calypso Gutenberg Editor: Focused launch on (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	let driver;

	before( 'Start browser', async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	describe( 'Launch a free site', function () {
		const siteName = dataHelper.getNewBlogName();

		before( 'Can log in', async function () {
			const loginFlow = new LoginFlow( driver );
			await loginFlow.login();
		} );

		step( 'Can create a free site', async function () {
			const gutenboardingUrl = dataHelper.getCalypsoURL( '/new' );
			await driver.get( gutenboardingUrl );
			await new GutenboardingFlow( driver ).createFreeSite( siteName );
		} );

		step( 'Can open focused launch modal', async function () {
			const launchButtonSelector = By.css( '.editor-gutenberg-launch__launch-button' );
			await driverHelper.clickWhenClickable( driver, launchButtonSelector );

			const focusedLaunchModalSelector = By.css( '.launch__focused-modal' );
			const isFocusedLaunchModalPresent = await driverHelper.isElementPresent(
				driver,
				focusedLaunchModalSelector
			);

			assert( isFocusedLaunchModalPresent, 'Focused launch modal did not open.' );
		} );

		step( 'Can see updated list of domains when changing site title', async function () {
			// Get the site title input
			const siteTitleInputSelector = By.css( '.focused-launch-summary__input input[type=text]' );

			// Site title step is not displayed when it has been set by user.
			// Site title is not set during `/start` flow, site title is can be set during `/new` flow.
			// If the site title input is not rendered, skip this step.
			// Note: This is currently parked here but unused as we are using the `/start` flow.
			const isSiteTitleInputPresent = await driverHelper.isElementPresent(
				driver,
				siteTitleInputSelector
			);

			if ( ! isSiteTitleInputPresent ) {
				return true;
			}

			// Set a site title
			const siteTitle = dataHelper.randomPhrase();
			await driverHelper.setWhenSettable( driver, siteTitleInputSelector, siteTitle, {
				pauseBetweenKeysMS: 10,
			} );

			// Wait for domain suggestions to reload.
			// Prevent the driver from picking up the previously displayed suggestion.
			await driver.sleep( 2000 );

			// Wait for the new suggestion items to be rendered,
			// and get the first domain suggestion item.
			const firstDomainSuggestionItemSelector = By.css(
				'.domain-picker__suggestion-item:first-child'
			);
			await driverHelper.waitTillPresentAndDisplayed( driver, firstDomainSuggestionItemSelector );

			// Remove the spaces and make everything lowercase to match with the suggested domains, e.g.
			// "Proud Elephants Wriggle Honestly" becomes "proudelephantswrigglehonestly"
			const normalizedSiteTitle = siteTitle.toLowerCase().replace( / /g, '' );

			// Check if there are domain suggestions that contains user entered site title
			const domainSuggestionsContainUserEnteredSiteTitleSelector = By.xpath(
				`//span[@class="domain-picker__domain-sub-domain" and .="${ normalizedSiteTitle }"]`
			);

			const domainSuggestionsContainUserEnteredSiteTitle = await driverHelper.isElementPresent(
				driver,
				domainSuggestionsContainUserEnteredSiteTitleSelector
			);

			assert(
				domainSuggestionsContainUserEnteredSiteTitle,
				'Domain suggestions did not include user entered site title.'
			);
		} );

		after( 'Delete the newly created site', async function () {
			const deleteSite = new DeleteSiteFlow( driver );
			await deleteSite.deleteSite( siteName + '.wordpress.com' );
		} );
	} );
} );
