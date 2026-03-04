import { DataHelper, HelpCenterComponent, TestAccount } from '@automattic/calypso-e2e';
import { Browser, Page, Locator } from 'playwright';
import { expect, test, tags } from '../../lib/pw-base';

test.describe.serial( 'Help Center in Calypso', { tag: [ tags.CALYPSO_PR ] }, () => {
	// Only run on desktop when merging to wp-calypso/trunk
	test.skip( ( { viewportName } ) => viewportName === 'mobile', 'Skipped on mobile viewports' );

	const normalizeString = ( str: string | null ) => str?.replace( /\s+/g, ' ' ).trim();

	let page: Page;
	let browser: Browser;
	let testAccount: TestAccount;
	let helpCenterComponent: HelpCenterComponent;
	let helpCenterLocator: Locator;

	test.beforeAll( async ( { browser: browserFixture } ) => {
		browser = browserFixture;
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
	test.describe( 'General Interaction', () => {
		test( 'Given user is authenticated Then help center is initially closed', async () => {
			expect( await helpCenterComponent.isVisible() ).toBeFalsy();
		} );

		test( 'When user opens the popover Then help center is visible', async () => {
			await helpCenterComponent.openPopover();

			expect( await helpCenterComponent.isVisible() ).toBeTruthy();
		} );

		test( 'And the popover is showing on the screen', async () => {
			expect( await helpCenterComponent.isPopoverShown() ).toBeTruthy();
		} );

		test( 'When user minimizes the popover Then it collapses to minimum height', async () => {
			await helpCenterComponent.minimizePopover();

			// Wait for the transition to complete.
			await page.waitForTimeout( 200 );

			const containerHeight = await helpCenterLocator.evaluate(
				( el: HTMLElement ) => el.offsetHeight
			);

			expect( containerHeight ).toBe( 56 );
		} );

		test( 'When user maximizes the popover Then the popover is showing on the screen', async () => {
			await helpCenterComponent.maximizePopover();
			expect( await helpCenterComponent.isPopoverShown() ).toBeTruthy();
		} );
	} );

	/**
	 * Articles
	 *
	 * These tests check the search function and article navigation.
	 */
	test.describe( 'Articles', () => {
		test( 'Given help center is open Then initial articles are shown', async () => {
			const articles = helpCenterComponent.getArticles();

			expect( await articles.count() ).toBeGreaterThanOrEqual( 1 );
		} );

		test( 'When user searches for a term Then matching articles are returned', async () => {
			await helpCenterComponent.search( 'Change a domain name address' );
			const resultTitles = await helpCenterComponent.getArticles().allTextContents();

			expect(
				resultTitles.some(
					( title ) => normalizeString( title )?.includes( 'Change a domain name address' )
				)
			).toBeTruthy();
		} );

		test( 'When user clicks an article Then the article loads correctly', async () => {
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

		test( 'When user closes the popover Then help center is not visible', async () => {
			await helpCenterComponent.closePopover();

			expect( await helpCenterComponent.isVisible() ).toBeFalsy();
		} );
	} );

	/**
	 * Support Flow
	 *
	 * These tests check the support flow. Starting with AI and then chat.
	 */
	test.describe.skip( 'Support Flow', () => {
		test( 'When user clicks Still need help Then the support flow starts', async () => {
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
		test( 'get forwarded to a human. Note: This test fails when chat is disabled. Search "WP.com contact via email" in #dotcom-support to confirm. Mute the test for the duration.', async () => {
			await helpCenterComponent.startAIChat( 'talk to human' );

			const contactSupportButton = helpCenterComponent.getContactSupportButton();
			await contactSupportButton.waitFor( { state: 'visible', timeout: 30000 } );

			expect( await contactSupportButton.count() ).toBeTruthy();
		} );

		/**
		 * These tests need to be update
		 */
		test( 'When user clicks the contact support button Then Zendesk messaging is shown', async () => {
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
	test.describe( 'Action Hooks', () => {
		test( 'Given help-center=home query param When page loads Then help center opens', async () => {
			await page.goto(
				DataHelper.getCalypsoURL( '/home/' + testAccount.getSiteURL( { protocol: false } ), {
					'help-center': 'home',
				} )
			);

			await helpCenterLocator.waitFor( { state: 'visible' } );

			expect( await helpCenterComponent.isPopoverShown() ).toBeTruthy();
		} );

		test( 'Given help-center=wapuu query param When page loads Then help center opens to Wapuu', async () => {
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
