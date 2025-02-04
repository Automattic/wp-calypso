/**
 * @group calypso-pr
 */

import {
	DataHelper,
	HelpCenterComponent,
	TestAccount,
	envVariables,
} from '@automattic/calypso-e2e';
import { Browser, Page, Locator } from 'playwright';
import { skipDescribeIf } from '../../jest-helpers';

declare const browser: Browser;

// Only run on desktop when merging to wp-calypso/trunk
skipDescribeIf( envVariables.VIEWPORT_NAME === 'mobile' )( 'Help Center in Calypso', () => {
	const normalizeString = ( str: string | null ) => str?.replace( /\s+/g, ' ' ).trim();

	let page: Page;
	let testAccount: TestAccount;
	let helpCenterComponent: HelpCenterComponent;
	let helpCenterLocator: Locator;

	// Setup the page and test account
	beforeAll( async function () {
		page = await browser.newPage();

		testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page, { waitUntilStable: true } );

		helpCenterComponent = new HelpCenterComponent( page );
		helpCenterLocator = helpCenterComponent.getHelpCenterLocator();

		// Set Zendesk to staging environment to prevent calling Zendesk API in test environment.
		await helpCenterComponent.setZendeskStaging();

		// Force Odie to Test mode.
		await helpCenterComponent.setOdieTestMode();
	} );

	/**
	 * General Interaction
	 *
	 * These tests check the general interaction with the Help Center popover.
	 */
	describe( 'General Interaction', () => {
		it( 'is initially closed', async () => {
			expect( await helpCenterComponent.isVisible() ).toBeFalsy();
		} );

		it( 'can be opened', async () => {
			await helpCenterComponent.openPopover();

			expect( await helpCenterComponent.isVisible() ).toBeTruthy();
		} );

		it( 'is showing on the screen', async () => {
			expect( await helpCenterComponent.isPopoverShown() ).toBeTruthy();
		} );

		it( 'can be minimized', async () => {
			await helpCenterComponent.minimizePopover();

			const containerHeight = await helpCenterLocator.evaluate(
				( el: HTMLElement ) => el.offsetHeight
			);

			expect( containerHeight ).toBe( 50 );
		} );

		it( 'can be maximized', async () => {
			await helpCenterComponent.maximizePopover();
			expect( await helpCenterComponent.isPopoverShown() ).toBeTruthy();
		} );
	} );

	/**
	 * Articles
	 *
	 * These tests check the search function and article navigation.
	 */
	describe( 'Articles', () => {
		it( 'initial articles are shown', async () => {
			const articles = helpCenterComponent.getArticles();

			expect( await articles.count() ).toBeGreaterThanOrEqual( 5 );
		} );

		it( 'search returns proper results', async () => {
			await helpCenterComponent.search( 'Change a Domain Name Address' );
			const resultTitles = await helpCenterComponent.getArticles().allTextContents();
			expect(
				resultTitles.some(
					( title ) => normalizeString( title )?.includes( 'Change a Domain Name Address' )
				)
			).toBeTruthy();
		} );

		it( 'post loads correctly', async () => {
			const article = await helpCenterComponent.getArticles().first();
			const articleTitle = await article.textContent();
			await article.click();

			// Make sure the API response is valid
			await page.waitForResponse(
				( response ) =>
					response.url().includes( '/wpcom/v2/help/article' ) && response.status() === 200
			);

			const articleHeader = await helpCenterLocator
				.getByRole( 'article' )
				.getByRole( 'heading' )
				.first();
			await articleHeader.waitFor( { state: 'visible' } );

			expect( normalizeString( await articleHeader.textContent() ) ).toBe(
				normalizeString( articleTitle )
			);

			await helpCenterComponent.goBack();
		} );

		it( 'the popover can be closed', async () => {
			await helpCenterComponent.closePopover();

			expect( await helpCenterComponent.isVisible() ).toBeFalsy();
		} );
	} );

	/**
	 * Support Flow
	 *
	 * These tests check the support flow. Starting with AI and then chat.
	 */
	describe.skip( 'Support Flow', () => {
		it( 'start support flow', async () => {
			const stillNeedHelpButton = helpCenterLocator.getByRole( 'button', {
				name: 'Still need help?',
			} );

			await stillNeedHelpButton.waitFor( { state: 'visible' } );
			await stillNeedHelpButton.click();

			expect( await helpCenterLocator.locator( '#odie-messages-container' ).count() ).toBeTruthy();
		} );

		// It's rare that chat is disabled so I'm opting to add a message to the test
		// description about muting the test instead of working around the failure
		// mode some other way. If this becomes tedious to maintain, please revisit and fix.
		it( 'get forwarded to a human. Note: This test fails when chat is disabled. Search "WP.com contact via email" in #dotcom-support to confirm. Mute the test for the duration.', async () => {
			await helpCenterComponent.startAIChat( 'talk to human' );

			const contactSupportButton = helpCenterComponent.getContactSupportButton();
			await contactSupportButton.waitFor( { state: 'visible', timeout: 30000 } );

			expect( await contactSupportButton.count() ).toBeTruthy();
		} );

		/**
		 * These tests need to be update
		 */
		it( 'start talking with a human', async () => {
			const contactSupportButton = await helpCenterComponent.getContactSupportButton();
			await contactSupportButton.click();

			const zendeskMessaging = await page.locator( 'iframe[title="Messaging window"]' );
			await zendeskMessaging.waitFor( { state: 'visible' } );

			expect( await zendeskMessaging.count() ).toBeTruthy();
		} );
	} );

	/**
	 * Action Hooks
	 *
	 * These tests Help Center opening on page load.
	 */
	describe( 'Action Hooks', () => {
		it( 'open help center on page load', async () => {
			await page.goto(
				DataHelper.getCalypsoURL( '/home/' + testAccount.getSiteURL( { protocol: false } ), {
					'help-center': 'home',
				} )
			);

			await helpCenterLocator.waitFor( { state: 'visible' } );

			expect( await helpCenterComponent.isPopoverShown() ).toBeTruthy();
		} );

		it( 'open help center to Wapuu on page load', async () => {
			await page.goto(
				DataHelper.getCalypsoURL( '/home/' + testAccount.getSiteURL( { protocol: false } ), {
					'help-center': 'wapuu',
				} )
			);

			await helpCenterLocator.waitFor( { state: 'visible' } );

			expect( await helpCenterComponent.isPopoverShown() ).toBeTruthy();
			expect( await helpCenterComponent.getOdieChat().count() ).toBeTruthy();
		} );
	} );
} );
