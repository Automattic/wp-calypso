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
			const currentStep = await startSiteFlow.getCurrentStep();

			if ( currentStep === 'goals' ) {
				await startSiteFlow.clickButton( 'Continue' );
			}
		} );
	} );

	// TODO: Add more cases for special characters, code injection, etc.
	describe.each( [
		// eslint-disable-next-line
		{
			search: '!"#$%&\'()*+,-./0123456789:;<=>?@[\\]^_`{|}~\t',
			description: 'Special characters',
		},
		// eslint-disable-next-line
		{
			search:
				'㌀㌁㌂㌃㌄㌅㌆㌇㌈㌉㌊㌋㌌㌍㌎㌏㌐㌑㌒㌓㌔㌕㌖㌗㌘㌙㌚㌛㌜㌝㌞㌟㌠㌡㌢㌣㌤㌥㌦㌧㌨㌩㌪㌫㌬㌭㌮㌯㌰㌱㌲㌳㌴㌵㌶㌷㌸㌹㌺㌻㌼㌽㌾㌿㍀㍁㍂㍃㍄㍅㍆㍇㍈㍉㍊㍋㍌㍍㍎㍏㍐㍑㍒㍓㍔㍕㍖㍗㍘㍙㍚㍛㍜㍝㍞㍟㍠㍡㍢㍣㍤㍥㍦㍧㍨㍩㍪㍫㍬㍭㍮㍯㍰㍱㍲㍳㍴㍵㍶㍻㍼㍽㍾㍿㎀㎁㎂㎃',
			description: 'CJK characters',
		},
		{
			search: '<script>alert("Hacked by KitKat!");</script>',
			description: 'JavaScript injection',
		},
		{
			search: 'Food OR 1=1',
			description: 'SQL injection',
		},
	] )( 'Vertical search value: $search', function ( { search, description } ) {
		it( 'Validating: ' + description, async function () {
			const currentStep = await startSiteFlow.getCurrentStep();
			if ( currentStep === 'vertical' ) {
				await startSiteFlow.clearVertical();
				await startSiteFlow.enterVertical( search );
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

	describe( 'Vertical flow: Finish', function () {
		// TODO: Go through theme selection flow
		it( 'Skip to dashboard', async function () {
			await startSiteFlow.clickButton( 'Skip to dashboard' );
		} );

		it( 'See home dashboard', async function () {
			const myHomePage = new MyHomePage( page );
			await myHomePage.validateOnHomePage();
		} );
	} );
} );
