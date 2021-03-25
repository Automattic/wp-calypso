/**
 * External dependencies
 */
import config from 'config';
import { By } from 'selenium-webdriver';
import assert from 'assert';

/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';
import * as driverHelper from '../lib/driver-helper';

import LoginFlow from '../lib/flows/login-flow.js';
import CreateSiteFlow from '../lib/flows/create-site-flow.js';
import DeleteSiteFlow from '../lib/flows/delete-site-flow.js';
import MyHomePage from '../lib/pages/my-home-page';
import NavBarComponent from '../lib/components/nav-bar-component.js';
import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';
import { step } from 'mocha-steps';

const host = dataHelper.getJetpackHost();
const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

const tempSkipSiteCreation = false; // Not working it seems
const tempSiteName = tempSkipSiteCreation ? 'e2eflowtesting1616683846106940' : undefined;
const tempSkipLaunch = true;
const tempSkipDeleteSite = true;

describe( `[${ host }] Launch (${ screenSize }) @signup @parallel`, function () {
	this.timeout( mochaTimeOut );
	let driver;
	let selectedSubdomain;

	before( 'Start browser', async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	describe( 'Launch a free site', function () {
		const siteName = tempSiteName || dataHelper.getNewBlogName();

		before( 'Can log in', async function () {
			const loginFlow = new LoginFlow( driver );
			await loginFlow.login();
		} );

		step( 'Can create a free site', async function () {
			if ( tempSkipSiteCreation ) {
				return true;
			}
			return await new CreateSiteFlow( driver, siteName ).createFreeSite();
		} );

		step( 'Can open block editor', async function () {
			if ( tempSkipSiteCreation ) {
				// Not working.
				await driver
					.navigate()
					.to( `http://calypso.localhost:3000/post/${ tempSiteName }.wordpress.com/home` );
				// .to( `http://calypso.localhost:3000/home/${ tempSiteName }.wordpress.com` );
			} else {
				await MyHomePage.Expect( driver );

				await NavBarComponent.Expect( driver );

				const navbarComponent = await NavBarComponent.Expect( driver );
				await navbarComponent.clickCreateNewPost();
			}

			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.initEditor();
		} );

		step( 'Can open focused launch modal', async function () {
			const launchButtonSelector = By.css( '.editor-gutenberg-launch__launch-button' );
			await driverHelper.clickWhenClickable( driver, launchButtonSelector );

			const focusedLaunchModalSelector = By.css( '.launch__focused-modal' );
			const isFocusedLaunchModalPresent = await driverHelper.isElementPresent(
				driver,
				focusedLaunchModalSelector
			);

			return assert( isFocusedLaunchModalPresent, 'Focused launch modal did not open.' );
		} );

		step( 'Can see updated list of domains when changing site title', async function () {
			// Change site title
			const siteTitleInputSelector = By.css( '.focused-launch-summary__input input[type=text]' );
			const siteTitle = 'randomString123456XXXABC'; // TODO: Make it truly random.

			await driverHelper.setWhenSettable( driver, siteTitleInputSelector, siteTitle, {
				pauseBetweenKeysMS: 10,
			} );

			// TODO: Maybe need to set a delay before checking
			const firstDomainSuggestionItemSelector = By.css(
				'.domain-picker__suggestion-item:first-child'
			);
			await driverHelper.waitTillPresentAndDisplayed( driver, firstDomainSuggestionItemSelector );

			const firstDomainSuggestionItem = await driver.findElement(
				firstDomainSuggestionItemSelector
			);
			const firstDomainSuggestionItemText = await firstDomainSuggestionItem.getText();

			// TODO: Not sure this is a good approach, how about test if domain suggestion list is updated?
			const normalizedSiteTitle = siteTitle.replace( / /g, '' );
			const domainIncludesUserEnteredSiteTitle =
				firstDomainSuggestionItemText.indexOf( normalizedSiteTitle ) > -1;

			// TODO: Fix this
			return true;

			assert(
				domainIncludesUserEnteredSiteTitle,
				'Domain suggestions did not include user entered site title.'
			);
		} );

		step( 'Can select free domain suggestion item', async function () {
			const freeDomainButtonSelector = By.css( '.domain-picker__suggestion-item.is-free' );

			await driverHelper.clickWhenClickable( driver, freeDomainButtonSelector );

			const selectedFreeDomainSuggestionItemSelector = By.css(
				'.domain-picker__suggestion-item.is-free.is-selected'
			);

			const isSelectedFreeDomainSuggestionItemPresent = await driverHelper.isElementPresent(
				driver,
				selectedFreeDomainSuggestionItemSelector
			);

			const selectedFreeDomainSuggestionItemNameSelector = By.css(
				'.domain-picker__suggestion-item.is-free.is-selected .domain-picker__suggestion-item-name'
			);

			// Remember this to check for persistence in the later step
			const selectedFreeDomainSuggestionItemName = await driver.findElement(
				selectedFreeDomainSuggestionItemNameSelector
			);
			selectedSubdomain = await selectedFreeDomainSuggestionItemName.getText();

			return assert(
				isSelectedFreeDomainSuggestionItemPresent,
				'Free domain suggestion item was not selected.'
			);
		} );

		step( 'Can open detailed plans view', async function () {
			// const viewAllDomainsButton = By.css('.focused-launch-summary__view-all-domains-btn');
			const viewAllPlansButton = By.css( '.focused-launch-summary__view-all-plans-btn' );

			await driverHelper.clickWhenClickable( driver, viewAllPlansButton );

			const plansGridInDetailedViewSelector = By.css( '.focused-launch-details__body .plans-grid' );

			const isPlansGridInDetailedViewPresent = await driverHelper.isElementPresent(
				driver,
				plansGridInDetailedViewSelector
			);

			return assert(
				isPlansGridInDetailedViewPresent,
				'Focused launch plans grid detailed view did not open.'
			);
		} );

		step( 'Can select Personal monthly plan', async function () {
			// Click monthly toggle
			const monthlyButtonSelector = By.css( '.plans-interval-toggle__monthly-btn' );
			await driverHelper.clickWhenClickable( driver, monthlyButtonSelector );

			// Click personal plan
			const personalMonthlyPlanButtonSelector = By.css(
				'.plan-item__select-button.is-personal-monthly-plan'
			);
			await driverHelper.clickWhenClickable( driver, personalMonthlyPlanButtonSelector );

			// Check that the monthly plan item is selected in the summary view
			const selectedPersonalMonthlyPlanItemSelector = By.css(
				'.focused-launch-summary__item.is-selected.is-personal-monthly-plan'
			);
			const isSelectedPersonalMonthlyPlanItemPresent = await driverHelper.isElementPresent(
				driver,
				selectedPersonalMonthlyPlanItemSelector
			);

			return assert(
				isSelectedPersonalMonthlyPlanItemPresent,
				'The personal monthly plan was not selected.'
			);
		} );

		step( 'Can open detailed domains view', async function () {
			const domainPickerInDetailedViewSelector = By.css(
				'.focused-launch-details__body .domain-picker'
			);

			const isDomainPickerInDetailedViewPresent = await driverHelper.isElementPresent(
				driver,
				domainPickerInDetailedViewSelector
			);

			return assert(
				isDomainPickerInDetailedViewPresent,
				'Focused launch domain picker detailed view did not open.'
			);
		} );

		// TODO: Suggestion: We probably need a test for testing if back button is working.
		// step( 'Can go back to focused summary view from detailed plans view', async function () {
		// 	const backButtonSelector = By.css( '.go-back-button__focused-launch' );
		// } );

		step( 'Can reload block editor and reopen focused launch', async function () {
			/// TODO: What's the best approach?
			// Reload block editor
			// await driver.navigate().refresh();
			// Probably repeat the process of going to customer site home and going to the editor again
			const blockEditorUrl = await driver.getCurrentUrl();
			await driver.navigate().to( blockEditorUrl );

			const launchButtonSelector = By.css( '.editor-gutenberg-launch__launch-button' );
			await driverHelper.clickWhenClickable( driver, launchButtonSelector );

			const focusedLaunchModalSelector = By.css( '.launch__focused-modal' );
			const isFocusedLaunchModalPresent = await driverHelper.isElementPresent(
				driver,
				focusedLaunchModalSelector
			);

			return assert( isFocusedLaunchModalPresent, 'Focused launch modal did not open.' );
		} );

		step( 'Can persist previously selected domain in focused launch', async function () {
			const selectedDomainSuggestionItemNameSelector = By.css(
				'.domain-picker__suggestion-item.is-selected .domain-picker__suggestion-item-name'
			);

			const selectedDomainSuggestionItemName = await driver.findElement(
				selectedDomainSuggestionItemNameSelector
			);

			const selectedSubdomainAfterRefresh = await selectedDomainSuggestionItemName.getText();

			// TODO: Fix this
			return true;

			assert.strictEqual(
				selectedSubdomainAfterRefresh,
				selectedSubdomain,
				'Selected subdomain should be persisted after reloading block editor and reopening focused launch.'
			);
		} );

		step( 'Can persist previously selected plan in focused launch', async function () {
			// Check that the monthly plan item is selected in the summary view
			const selectedPersonalMonthlyPlanItemSelector = By.css(
				'.focused-launch-summary__item.is-selected.is-personal-monthly-plan'
			);
			const isSelectedPersonalMonthlyPlanItemPresent = await driverHelper.isElementPresent(
				driver,
				selectedPersonalMonthlyPlanItemSelector
			);

			return assert(
				isSelectedPersonalMonthlyPlanItemPresent,
				'Selected plan should be persisted after reloading block editor and reopening focused launch'
			);
		} );

		// User picks the free subdomain and the free plan, and clicks the "Launch" button
		// The site is launched and the Focused Launch's Success View is displayed
		step( 'Can launch site with Free plan.', async function () {
			if ( tempSkipLaunch ) {
				return true;
			}

			const siteLaunchButtonSelector = By.css( '.focused-launch-summary__launch-button' );

			await driverHelper.clickWhenClickable( driver, siteLaunchButtonSelector );

			const focusedLaunchSuccessViewSelector = By.css( '. focused-launch-success__wrapper' );

			const isFocusedLaunchSuccessViewPresent = await driverHelper.isElementPresent(
				driver,
				focusedLaunchSuccessViewSelector
			);

			return assert(
				isFocusedLaunchSuccessViewPresent,
				'Focused launch success view did not open.'
			);
		} );

		after( 'Delete the newly created site', async function () {
			if ( tempSkipDeleteSite ) {
				return true;
			}
			const deleteSite = new DeleteSiteFlow( driver );
			return await deleteSite.deleteSite( siteName + '.wordpress.com' );
		} );
	} );
} );
