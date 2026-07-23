import {
	DataHelper,
	HelpCenterComponent,
	TestAccount,
	envVariables,
} from '@automattic/calypso-e2e';
import { Locator } from 'playwright';
import { expect, skipIfNotTrunk, tags, test } from '../../lib/pw-base';

test.describe( 'Help Center in Calypso', { tag: [ tags.CALYPSO_PR ] }, () => {
	skipIfNotTrunk();

	const normalizeString = ( str: string | null ) => str?.replace( /\s+/g, ' ' ).trim();

	test( 'As a user, I can interact with the Help Center in Calypso', async ( { page } ) => {
		// Only run on desktop when merging to wp-calypso/trunk
		test.skip( envVariables.VIEWPORT_NAME === 'mobile', 'Skipped on mobile viewport' );

		let testAccount: TestAccount;
		let helpCenterComponent: HelpCenterComponent;
		let helpCenterLocator: Locator;

		await test.step( 'Setup the page and test account', async () => {
			testAccount = new TestAccount( 'defaultUser' );
			await testAccount.authenticate( page, { waitUntilStable: true } );

			helpCenterComponent = new HelpCenterComponent( page );
			helpCenterLocator = helpCenterComponent.getHelpCenterLocator();

			await helpCenterComponent.setZendeskStaging();
			await helpCenterComponent.setOdieTestMode();
		} );

		// General Interaction

		await test.step( 'Help Center is initially closed', async () => {
			await expect( helpCenterLocator ).toBeHidden();
		} );

		await test.step( 'Help Center can be opened', async () => {
			await helpCenterComponent.openPopover();
			await expect( helpCenterLocator ).toBeVisible();
		} );

		await test.step( 'Help Center is showing on the screen', async () => {
			expect( await helpCenterComponent.isPopoverShown() ).toBeTruthy();
		} );

		await test.step( 'Help Center can be minimized', async () => {
			await helpCenterComponent.minimizePopover();
			await page.waitForTimeout( 200 );
			const containerHeight = await helpCenterLocator.evaluate(
				( el: HTMLElement ) => el.offsetHeight
			);
			expect( containerHeight ).toBe( 56 );
		} );

		await test.step( 'Help Center can be maximized', async () => {
			await helpCenterComponent.maximizePopover();
			expect( await helpCenterComponent.isPopoverShown() ).toBeTruthy();
		} );

		// Articles

		await test.step( 'Initial articles are shown', async () => {
			const articles = helpCenterComponent.getArticles();
			expect( await articles.count() ).toBeGreaterThanOrEqual( 1 );
		} );

		await test.step( 'Search returns proper results', async () => {
			await helpCenterComponent.search( 'Change a domain name address' );
			const resultTitles = await helpCenterComponent.getArticles().allTextContents();
			expect(
				resultTitles.some(
					( title ) => normalizeString( title )?.includes( 'Change a domain name address' )
				)
			).toBeTruthy();
		} );

		await test.step( 'Post loads correctly', async () => {
			const article = helpCenterComponent.getArticles().first();
			const articleTitle = await article.textContent();
			await article.click();

			await page.waitForResponse(
				( response ) =>
					response.url().includes( '/wpcom/v2/help/article' ) && response.status() === 200
			);

			const articleHeader = helpCenterLocator.getByRole( 'article' ).getByRole( 'heading' ).first();
			await articleHeader.waitFor( { state: 'visible' } );

			expect( normalizeString( await articleHeader.textContent() ) ).toBe(
				normalizeString( articleTitle )
			);

			await helpCenterComponent.goBack();
		} );

		await test.step( 'The popover can be closed', async () => {
			await helpCenterComponent.closePopover();
			await expect( helpCenterLocator ).toBeHidden();
		} );

		// Action Hooks

		await test.step( 'Open help center on page load', async () => {
			await page.goto(
				DataHelper.getCalypsoURL( '/home/' + testAccount.getSiteURL( { protocol: false } ), {
					'help-center': 'home',
				} )
			);

			await helpCenterLocator.waitFor( { state: 'visible' } );
			expect( await helpCenterComponent.isPopoverShown() ).toBeTruthy();
		} );

		await test.step( 'Open help center to Wapuu on page load', async () => {
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

	/**
	 * Support Flow
	 *
	 * These tests check the support flow. Starting with AI and then chat.
	 */
	test.describe.skip( 'Support Flow', () => {
		test( 'start support flow', async ( { page } ) => {
			const helpCenterComponent = new HelpCenterComponent( page );
			const helpCenterLocator = helpCenterComponent.getHelpCenterLocator();

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
		test( 'get forwarded to a human. Note: This test fails when chat is disabled. Search "WP.com contact via email" in #dotcom-support to confirm. Mute the test for the duration.', async ( {
			page,
		} ) => {
			const helpCenterComponent = new HelpCenterComponent( page );

			await helpCenterComponent.startAIChat( 'talk to human' );

			const contactSupportButton = helpCenterComponent.getContactSupportButton();
			await contactSupportButton.waitFor( { state: 'visible', timeout: 30000 } );

			expect( await contactSupportButton.count() ).toBeTruthy();
		} );

		test( 'start talking with a human', async ( { page } ) => {
			const helpCenterComponent = new HelpCenterComponent( page );

			const contactSupportButton = helpCenterComponent.getContactSupportButton();
			await contactSupportButton.click();

			const zendeskMessaging = page.locator( 'iframe[title="Messaging window"]' );
			await zendeskMessaging.waitFor( { state: 'visible' } );

			expect( await zendeskMessaging.count() ).toBeTruthy();
		} );
	} );
} );
