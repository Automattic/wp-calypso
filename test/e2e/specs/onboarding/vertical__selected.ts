/**
 * @group calypso-pr
 */

import {
	BrowserManager,
	DataHelper,
	MyHomePage,
	StartSiteFlow,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Vertical: Selected' ), function () {
	// TODO: Find a more elegant way to use a test account's existing site
	const siteSlug = 'e2eflowtestingprereleaseuser2.wordpress.com';

	let page: Page;
	let startSiteFlow: StartSiteFlow;

	beforeAll( async () => {
		page = await browser.newPage();
		const testAccount = new TestAccount( 'calypsoPreReleaseUser' );
		await testAccount.authenticate( page );
	} );

	describe( 'Start setup flow', function () {
		beforeAll( async function () {
			await BrowserManager.setStoreCookie( page );
		} );

		it( 'Skip goals step', async function () {
			startSiteFlow = new StartSiteFlow( page );
			await startSiteFlow.startGoalsSetup( siteSlug );
			await page.waitForLoadState( 'networkidle' );
			const currentStep = await startSiteFlow.getCurrentStep();

			if ( currentStep === 'goals' ) {
				await startSiteFlow.clickButton( 'Continue' );
			}
		} );
	} );

	describe( 'Vertical flow: Input-based selection', function () {
		// TODO: Parameterize test with a list of common verticals
		it( 'Select a vertical based on input', async function () {
			const currentStep = await startSiteFlow.getCurrentStep();
			if ( currentStep === 'vertical' ) {
				await startSiteFlow.enterVertical( 'People & Society' );
				await startSiteFlow.selectVertical( 'People & Society' );
				await startSiteFlow.clickButton( 'Continue' );
			}
		} );

		it( 'See design picker screen', async function () {
			await startSiteFlow.validateOnDesignSetupScreen();

			// TODO: Get header validation working
			// await startSiteFlow.validateVerticalDesignHeader( 'vertical' );
		} );

		// TODO: Investigate back button waitForLoadState issue
		it( 'Navigate back', async function () {
			await startSiteFlow.goBackOneScreen();
		} );
	} );

	describe( 'Vertical flow: Manual entry', function () {
		it( 'Enter a vertical manually', async function () {
			const currentStep = await startSiteFlow.getCurrentStep();
			if ( currentStep === 'vertical' ) {
				await startSiteFlow.clearVertical();
				await startSiteFlow.enterVertical( 'People & Society' );
				await startSiteFlow.toggleVerticalDropdown();
				await startSiteFlow.clickButton( 'Continue' );
			}
		} );

		// Validate that theme picker is used instead of vertical design screen
		// TODO: Investigate if manually entering an exact vertical match should
		// result in a vertical being selected
		it( 'See theme picker screen', async function () {
			await startSiteFlow.validateOnDesignPickerScreen();
		} );

		it( 'Navigate back', async function () {
			await startSiteFlow.goBackOneScreen();
		} );
	} );

	describe( 'Vertical flow: Suggestion dropdown', function () {
		it( 'Select a vertical from the suggestions dropdown', async function () {
			const currentStep = await startSiteFlow.getCurrentStep();
			if ( currentStep === 'vertical' ) {
				await startSiteFlow.toggleVerticalDropdown();

				// TODO: Select a random vertical from the suggested list
				await startSiteFlow.selectVertical( 'Food' );
				await startSiteFlow.clickButton( 'Continue' );
			}
		} );

		it( 'See design picker screen', async function () {
			await startSiteFlow.validateOnDesignSetupScreen();

			// TODO: Get header validation working
			// await startSiteFlow.validateVerticalDesignHeader( 'vertical' );
		} );

		// TODO: Find a better way to validate the selected vertical design

		it( 'Select a design', async function () {
			await startSiteFlow.clickButton( 'Continue' );
		} );

		it( 'See site on home dashboard', async function () {
			const myHomePage = new MyHomePage( page );
			await myHomePage.validateSiteTitle( 'Food' );
		} );
	} );
} );
