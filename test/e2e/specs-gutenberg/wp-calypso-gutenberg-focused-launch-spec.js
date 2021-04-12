/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import { By, until } from 'selenium-webdriver';
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
import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

const host = dataHelper.getJetpackHost();
const screenSize = driverManager.currentScreenSize();

describe( `[${ host }] Calypso Gutenberg Editor: Focused launch on (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	let driver;
	let selectedSubdomain;

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
			// Site title is not set during `/start` flow, site title can be set during `/new` flow.
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
			const domainSuggestionsContainUserEnteredSiteTitleSelector = driverHelper.getElementByText(
				driver,
				By.css( `.domain-picker__domain-sub-domain` ),
				normalizedSiteTitle
			);

			const domainSuggestionsContainUserEnteredSiteTitle = await driverHelper.isElementPresent(
				driver,
				domainSuggestionsContainUserEnteredSiteTitleSelector
			);

			assert(
				domainSuggestionsContainUserEnteredSiteTitle,
				`Domain suggestions did not include user entered site title. Site title used was ${ siteTitle }.`
			);
		} );

		step( 'Can select free domain suggestion item', async function () {
			// Click on the free domain suggestion item
			const freeDomainButtonSelector = By.css( '.domain-picker__suggestion-item.is-free' );

			await driverHelper.clickWhenClickable( driver, freeDomainButtonSelector );

			// Check if the free domain suggestion item is now selected
			const selectedFreeDomainSuggestionItemSelector = By.css(
				'.domain-picker__suggestion-item.is-free.is-selected'
			);

			const isSelectedFreeDomainSuggestionItemPresent = await driverHelper.isElementPresent(
				driver,
				selectedFreeDomainSuggestionItemSelector
			);

			// Get the domain name from the free domain suggestion item
			// This is to check for persistence in the later step
			const selectedFreeDomainSuggestionItemNameSelector = By.css(
				'.domain-picker__suggestion-item.is-free.is-selected .domain-picker__suggestion-item-name'
			);

			const selectedFreeDomainSuggestionItemName = await driver.findElement(
				selectedFreeDomainSuggestionItemNameSelector
			);

			// This is used in later step to test for selected domain persistence
			selectedSubdomain = await selectedFreeDomainSuggestionItemName.getText();

			assert(
				isSelectedFreeDomainSuggestionItemPresent,
				'Free domain suggestion item was not selected.'
			);
		} );

		step( 'Can open detailed plans grid', async function () {
			// Click on "View All Plans" button
			const viewAllPlansButtonSelector = driverHelper.getElementByText(
				driver,
				By.css( `.focused-launch-summary__details-link` ),
				'View all plans'
			);

			await driverHelper.clickWhenClickable( driver, viewAllPlansButtonSelector );

			// Check if detailed plans grid is displayed
			const plansGridInDetailedViewSelector = By.css( '.focused-launch-details__body .plans-grid' );

			const isPlansGridInDetailedViewPresent = await driverHelper.isElementPresent(
				driver,
				plansGridInDetailedViewSelector
			);

			assert(
				isPlansGridInDetailedViewPresent,
				'Focused launch plans grid detailed view did not open.'
			);
		} );

		step( 'Can switch to monthly plans view', async function () {
			// Click "Monthly" toggle button
			const monthlyButtonSelector = driverHelper.getElementByText(
				driver,
				By.css( `.plans-interval-toggle__label` ),
				'Monthly'
			);

			await driverHelper.clickWhenClickable( driver, monthlyButtonSelector );

			// Check if plans grid is really switched over to monthly view
			// by checking if the price note "per month, billed monthly" exists.
			const perMonthBilledMonthlyPriceNoteSelector = driverHelper.getElementByText(
				driver,
				By.css( `.plan-item__price-note` ),
				'per month, billed monthly'
			);

			const isPerMonthBilledMonthlyPricePresent = await driverHelper.isElementPresent(
				driver,
				perMonthBilledMonthlyPriceNoteSelector
			);

			assert(
				isPerMonthBilledMonthlyPricePresent,
				'Focused launch plans grid was unable to switch over to monthly view.'
			);
		} );

		step( 'Can select Personal monthly plan', async function () {
			// Click "Select Personal" button
			const selectPersonalPlanButtonSelector = driverHelper.getElementByText(
				driver,
				By.css( `.plan-item__select-button` ),
				'Select Personal'
			);

			await driverHelper.clickWhenClickable( driver, selectPersonalPlanButtonSelector );

			// When the detailed plans grid is closed and user returns to the summary view,
			// check if the selected monthly plan item is "Personal Plan".
			const selectedPlanIsPersonalMonthlyPlanSelector = driverHelper.getElementByText(
				driver,
				By.css( '.focused-launch-summary__item.is-selected' ),
				/Personal Plan/
			);

			const selectedPlanIsPersonalMonthlyPlan = await driverHelper.isElementPresent(
				driver,
				selectedPlanIsPersonalMonthlyPlanSelector
			);

			assert( selectedPlanIsPersonalMonthlyPlan, 'The personal monthly plan was not selected.' );
		} );

		step( 'Can reload block editor and reopen focused launch', async function () {
			// Reload block editor
			await driver.navigate().refresh();

			// Press "Reload" on confirmation dialog when block editor asks if user really wants to navigate away.
			try {
				await driver.wait( until.alertIsPresent(), 4000 );
				const alert = await driver.switchTo().alert();
				await alert.accept();
			} catch ( e ) {
				// This doesn't happen when autosave hasn't kicked in so
				// if driver.wait throws and error we catch it here to allow
				// the step to continue running.
			}

			// Wait for block editor to load and switch frame context to block editor
			await GutenbergEditorComponent.Expect( driver );

			// Click on the launch button
			const launchButtonSelector = By.css( '.editor-gutenberg-launch__launch-button' );
			await driverHelper.clickWhenClickable( driver, launchButtonSelector );

			// See if focused launch modal can be reopened
			const focusedLaunchModalSelector = By.css( '.launch__focused-modal' );
			const isFocusedLaunchModalPresent = await driverHelper.isElementPresent(
				driver,
				focusedLaunchModalSelector
			);

			assert( isFocusedLaunchModalPresent, 'Focused launch modal did not open.' );
		} );

		step( 'Can persist previously selected domain in focused launch', async function () {
			const selectedDomainSuggestionItemNameSelector = By.css(
				'.domain-picker__suggestion-item.is-selected .domain-picker__suggestion-item-name'
			);

			const selectedDomainSuggestionItemName = await driver.findElement(
				selectedDomainSuggestionItemNameSelector
			);

			const selectedSubdomainAfterRefresh = await selectedDomainSuggestionItemName.getText();

			assert.strictEqual(
				selectedSubdomainAfterRefresh,
				selectedSubdomain,
				'Selected subdomain should be persisted after reloading block editor and reopening focused launch.'
			);
		} );

		step( 'Can persist previously selected plan in focused launch', async function () {
			// Check if the selected monthly plan item is "Personal Plan".
			const selectedPlanIsPersonalMonthlyPlanSelector = By.xpath(
				'//button[contains(@class, "focused-launch-summary__item") and contains(@class, "is-selected")]//span[@class="focused-launch-summary-item__leading-side-label" and .="Personal Plan"]'
			);

			const selectedPlanIsPersonalMonthlyPlan = await driverHelper.isElementPresent(
				driver,
				selectedPlanIsPersonalMonthlyPlanSelector
			);

			assert(
				selectedPlanIsPersonalMonthlyPlan,
				'Selected plan should be persisted after reloading block editor and reopening focused launch'
			);
		} );

		after( 'Delete the newly created site', async function () {
			const deleteSite = new DeleteSiteFlow( driver );
			await deleteSite.deleteSite( siteName + '.wordpress.com' );
		} );
	} );
} );
