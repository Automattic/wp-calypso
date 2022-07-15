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

describe( DataHelper.createSuiteTitle( 'Vertical: None, Something Else, or Skip' ), function () {
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

			await startSiteFlow.clickButton( 'Continue' );
		} );
	} );

	describe( 'Vertical flow: No match', function () {
		it( 'Enter a vertical without a match', async function () {
			const currentStep = await startSiteFlow.getCurrentStep();
			if ( currentStep === 'vertical' ) {
				await startSiteFlow.clearVertical();
				await startSiteFlow.enterVertical( 'KitKat team rules!' );
				await startSiteFlow.toggleVerticalDropdown();
				await startSiteFlow.clickButton( 'Continue' );
			}
		} );

		// Validate that theme picker is used instead of vertical design screen
		it( 'See theme picker screen', async function () {
			await startSiteFlow.validateOnDesignPickerScreen();
		} );

		it( 'Navigate back', async function () {
			await startSiteFlow.goBackOneScreen();
		} );
	} );

	describe( 'Vertical flow: Skip selection', function () {
		it( 'Skip vertical selection', async function () {
			const currentStep = await startSiteFlow.getCurrentStep();
			if ( currentStep === 'vertical' ) {
				await startSiteFlow.clickButton( 'Continue' );
			}
		} );

		// Validate that theme picker is used instead of vertical design screen
		it( 'See theme picker screen', async function () {
			await startSiteFlow.validateOnDesignPickerScreen();
		} );

		it( 'Navigate back', async function () {
			await startSiteFlow.goBackOneScreen();
		} );
	} );

	describe( 'Vertical flow: Something else', function () {
		it( 'Select Something else', async function () {
			const currentStep = await startSiteFlow.getCurrentStep();
			if ( currentStep === 'vertical' ) {
				await startSiteFlow.enterVertical( 'People & Society' );
				await startSiteFlow.selectVertical( 'Something else' );
				await startSiteFlow.clickButton( 'Continue' );
			}
		} );

		// Validate that theme picker is used instead of vertical design screen
		it( 'See theme picker screen', async function () {
			await startSiteFlow.validateOnDesignPickerScreen();
		} );

		it( 'Navigate back', async function () {
			await startSiteFlow.goBackOneScreen();
		} );
	} );

	describe( 'Vertical flow: Skip to dashboard', function () {
		// TODO: Add case where user goes through theme selection flow
		it( 'Skip to dashboard', async function () {
			await startSiteFlow.clickButton( 'Skip to dashboard' );
		} );

		// TODO: Investigate bug where last selected vertical is used even when
		// vertical is eventually skipped
		it( 'See site on home dashboard', async function () {
			const myHomePage = new MyHomePage( page );
			await myHomePage.validateSiteTitle( 'Something else' );
		} );
	} );
} );
