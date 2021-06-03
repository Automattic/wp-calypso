/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper.js';
import * as driverHelper from '../../lib/driver-helper';
import LoginFlow from '../../lib/flows/login-flow.js';
import DeleteSiteFlow from '../../lib/flows/delete-site-flow.js';
import GutenboardingFlow from '../../lib/flows/gutenboarding-flow.js';
import GutenbergEditorComponent from '../../lib/gutenberg/gutenberg-editor-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const explicitWaitMS = config.get( 'explicitWaitMS' );

const host = dataHelper.getJetpackHost();
const screenSize = driverManager.currentScreenSize();

describe( `[${ host }] Calypso Gutenberg Editor: Focused launch on (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	let selectedSubdomain;

	describe( 'Launch a free site', function () {
		const siteName = dataHelper.getNewBlogName();

		before( 'Can log in', async function () {
			const loginFlow = new LoginFlow( this.driver );
			await loginFlow.login();
		} );

		it( 'Can create a free site', async function () {
			const gutenboardingUrl = dataHelper.getCalypsoURL( '/new' );
			await this.driver.get( gutenboardingUrl );
			await new GutenboardingFlow( this.driver ).createFreeSite( siteName );
		} );

		it( 'Can open focused launch modal', async function () {
			const launchButtonLocator = driverHelper.createTextLocator(
				By.css( '.editor-gutenberg-launch__launch-button' ),
				'Launch'
			);
			await driverHelper.clickWhenClickable( this.driver, launchButtonLocator );

			const focusedLaunchModalLocator = By.css( '.launch__focused-modal' );
			const isFocusedLaunchModalPresent = await driverHelper.isElementLocated(
				this.driver,
				focusedLaunchModalLocator
			);

			assert( isFocusedLaunchModalPresent, 'Focused launch modal did not open.' );
		} );

		it( 'Can see updated list of domains when changing site title', async function () {
			// Get the site title input
			const siteTitleInputLocator = By.css( '.focused-launch-summary__input input[type=text]' );

			// Site title step is not displayed when it has been set by user.
			// Site title is not set during `/start` flow, site title can be set during `/new` flow.
			// If the site title input is not rendered, skip this step.
			// Note: This is currently parked here but unused as we are using the `/start` flow.
			const isSiteTitleInputPresent = await driverHelper.isElementLocated(
				this.driver,
				siteTitleInputLocator
			);

			if ( ! isSiteTitleInputPresent ) {
				return true;
			}

			// Set a site title
			const siteTitle = dataHelper.randomPhrase();
			await driverHelper.setWhenSettable( this.driver, siteTitleInputLocator, siteTitle, {
				pauseBetweenKeysMS: 10,
			} );

			// Wait for domain suggestions to reload.
			// Prevent the driver from picking up the previously displayed suggestion.
			await this.driver.sleep( 2000 );

			// Wait for the new suggestion items to be rendered,
			// and get the first domain suggestion item.
			const firstDomainSuggestionItemLocator = By.css(
				'.domain-picker__suggestion-item:first-child'
			);
			await driverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
				firstDomainSuggestionItemLocator
			);

			// Remove the spaces and make everything lowercase to match with the suggested domains, e.g.
			// "Proud Elephants Wriggle Honestly" becomes "proudelephantswrigglehonestly"
			const normalizedSiteTitle = siteTitle.toLowerCase().replace( / /g, '' );

			// Check if there are domain suggestions that contains user entered site title
			const domainSuggestionsContainUserEnteredSiteTitleLocator = driverHelper.createTextLocator(
				By.css( `.domain-picker__domain-sub-domain` ),
				normalizedSiteTitle
			);

			const domainSuggestionsContainUserEnteredSiteTitle = await driverHelper.isElementLocated(
				this.driver,
				domainSuggestionsContainUserEnteredSiteTitleLocator
			);

			assert(
				domainSuggestionsContainUserEnteredSiteTitle,
				`Domain suggestions did not include user entered site title. Site title used was ${ siteTitle }.`
			);
		} );

		it( 'Can select free domain suggestion item', async function () {
			// Click on the free domain suggestion item
			const freeDomainButtonLocator = By.css( '.domain-picker__suggestion-item.is-free' );

			await driverHelper.clickWhenClickable( this.driver, freeDomainButtonLocator );

			// Check if the free domain suggestion item is now selected
			const selectedFreeDomainSuggestionItemLocator = By.css(
				'.domain-picker__suggestion-item.is-free.is-selected'
			);

			const isSelectedFreeDomainSuggestionItemPresent = await driverHelper.isElementLocated(
				this.driver,
				selectedFreeDomainSuggestionItemLocator
			);

			// Get the domain name from the free domain suggestion item
			// This is to check for persistence in the later step
			const selectedFreeDomainSuggestionItemNameLocator = By.css(
				'.domain-picker__suggestion-item.is-free.is-selected .domain-picker__suggestion-item-name'
			);

			const selectedFreeDomainSuggestionItemName = await this.driver.findElement(
				selectedFreeDomainSuggestionItemNameLocator
			);

			// This is used in later step to test for selected domain persistence
			selectedSubdomain = await selectedFreeDomainSuggestionItemName.getText();

			assert(
				isSelectedFreeDomainSuggestionItemPresent,
				'Free domain suggestion item was not selected.'
			);
		} );

		it( 'Can open detailed plans grid', async function () {
			// Click on "View All Plans" button
			const viewAllPlansButtonLocator = driverHelper.createTextLocator(
				By.css( `.focused-launch-summary__details-link` ),
				'View all plans'
			);

			await driverHelper.clickWhenClickable( this.driver, viewAllPlansButtonLocator );

			// Check if detailed plans grid is displayed
			const plansGridInDetailedViewLocator = By.css( '.focused-launch-details__body .plans-grid' );

			const isPlansGridInDetailedViewPresent = await driverHelper.isElementLocated(
				this.driver,
				plansGridInDetailedViewLocator
			);

			assert(
				isPlansGridInDetailedViewPresent,
				'Focused launch plans grid detailed view did not open.'
			);
		} );

		it( 'Can switch to monthly plans view', async function () {
			// Click "Monthly" toggle button
			const monthlyButtonLocator = driverHelper.createTextLocator(
				By.css( `.plans-interval-toggle__label` ),
				'Monthly'
			);

			await driverHelper.clickWhenClickable( this.driver, monthlyButtonLocator );

			// Check if plans grid is really switched over to monthly view
			// by checking if the price note "per month, billed monthly" exists.
			const perMonthBilledMonthlyPriceNoteLocator = driverHelper.createTextLocator(
				By.css( `.plan-item__price-note` ),
				'per month, billed monthly'
			);

			const isPerMonthBilledMonthlyPricePresent = await driverHelper.isElementLocated(
				this.driver,
				perMonthBilledMonthlyPriceNoteLocator
			);

			assert(
				isPerMonthBilledMonthlyPricePresent,
				'Focused launch plans grid was unable to switch over to monthly view.'
			);
		} );

		it( 'Can select Personal monthly plan', async function () {
			// Click "Select Personal" button
			const selectPersonalPlanButtonLocator = driverHelper.createTextLocator(
				By.css( `.plan-item__select-button` ),
				'Select Personal'
			);

			await driverHelper.clickWhenClickable( this.driver, selectPersonalPlanButtonLocator );

			// When the detailed plans grid is closed and user returns to the summary view,
			// check if the selected monthly plan item is "Personal Plan".
			const selectedPlanIsPersonalMonthlyPlanLocator = driverHelper.createTextLocator(
				By.css( '.focused-launch-summary__item.is-selected' ),
				/Personal Plan/
			);

			const selectedPlanIsPersonalMonthlyPlan = await driverHelper.isElementLocated(
				this.driver,
				selectedPlanIsPersonalMonthlyPlanLocator
			);

			assert( selectedPlanIsPersonalMonthlyPlan, 'The personal monthly plan was not selected.' );
		} );

		it( 'Can reload block editor and reopen focused launch', async function () {
			// Reload block editor
			await this.driver.navigate().refresh();

			// Press "Reload" on confirmation dialog when block editor asks if user really wants to
			// navigate away.
			try {
				await driverHelper.waitUntilAlertPresent( this.driver, explicitWaitMS / 5 );
				await driverHelper.acceptAlertIfPresent( this.driver );
			} catch {
				// This doesn't happen when autosave hasn't kicked in so if driver.wait throws and error we
				// catch it here to allow the step to continue running.
			}

			// Wait for block editor to load and switch frame context to block editor
			await GutenbergEditorComponent.Expect( this.driver );

			// Click on the launch button
			const launchButtonLocator = driverHelper.createTextLocator(
				By.css( '.editor-gutenberg-launch__launch-button' ),
				'Launch'
			);
			await driverHelper.clickWhenClickable( this.driver, launchButtonLocator );

			// See if focused launch modal can be reopened
			const focusedLaunchModalLocator = By.css( '.launch__focused-modal' );
			const isFocusedLaunchModalPresent = await driverHelper.isElementLocated(
				this.driver,
				focusedLaunchModalLocator
			);

			assert( isFocusedLaunchModalPresent, 'Focused launch modal did not open.' );
		} );

		it( 'Can persist previously selected domain in focused launch', async function () {
			const selectedDomainSuggestionContainingPreviouslySelectedSubdomainLocator = driverHelper.createTextLocator(
				By.css( '.domain-picker__suggestion-item.is-selected' ),
				new RegExp( selectedSubdomain )
			);

			const selectedDomainSuggestionIsPreviouslySelectedSubdomain = await driverHelper.isElementLocated(
				this.driver,
				selectedDomainSuggestionContainingPreviouslySelectedSubdomainLocator
			);

			assert(
				selectedDomainSuggestionIsPreviouslySelectedSubdomain,
				'Selected subdomain should be persisted after reloading block editor and reopening focused launch.'
			);
		} );

		it( 'Can persist previously selected plan in focused launch', async function () {
			// Check if the selected monthly plan item is "Personal Plan".
			const selectedPlanIsPersonalMonthlyPlanLocator = driverHelper.createTextLocator(
				By.css( `.focused-launch-summary__item.is-selected` ),
				/Personal Plan/
			);

			const selectedPlanIsPersonalMonthlyPlan = await driverHelper.isElementLocated(
				this.driver,
				selectedPlanIsPersonalMonthlyPlanLocator
			);

			assert(
				selectedPlanIsPersonalMonthlyPlan,
				'Selected plan should be persisted after reloading block editor and reopening focused launch'
			);
		} );

		it( 'Can select Free plan', async function () {
			// Click "Free Plan" button
			const freePlanLocator = driverHelper.createTextLocator(
				By.css( '.focused-launch-summary__item' ),
				/Free Plan/
			);

			await driverHelper.clickWhenClickable( this.driver, freePlanLocator );

			// When the detailed plans grid is closed and user returns to the summary view,
			// check if the selected monthly plan item is "Free Plan".
			const selectedPlanIsFreePlanLocator = driverHelper.createTextLocator(
				By.css( '.focused-launch-summary__item.is-selected' ),
				/Free Plan/
			);

			const selectedPlanIsFreePlan = await driverHelper.isElementLocated(
				this.driver,
				selectedPlanIsFreePlanLocator
			);

			assert( selectedPlanIsFreePlan, 'The free plan was not selected.' );
		} );

		it( 'Can launch site with Free plan.', async function () {
			// Click on the launch button
			const siteLaunchButtonLocator = By.css( '.focused-launch-summary__launch-button' );
			await driverHelper.clickWhenClickable( this.driver, siteLaunchButtonLocator );

			// Wait for the focused launch success view to show up
			const focusedLaunchSuccessViewLocator = By.css( '.focused-launch-success__wrapper' );

			const isFocusedLaunchSuccessViewPresent = await driverHelper.isElementLocated(
				this.driver,
				focusedLaunchSuccessViewLocator
			);

			assert( isFocusedLaunchSuccessViewPresent, 'Focused launch success view did not open.' );
		} );

		after( 'Delete the newly created site', async function () {
			const deleteSite = new DeleteSiteFlow( this.driver );
			await deleteSite.deleteSite( siteName + '.wordpress.com' );
		} );
	} );
} );
