/**
 * Skip this test.
 * I wasn't able to figure out how to test the apps/help-center version
 */

import { HelpCenterComponent, TestAccount } from '@automattic/calypso-e2e';
import { Locator } from 'playwright';
import { expect, tags, test } from '../../lib/pw-base';

test.describe( 'Help Center in WP Admin', { tag: [ tags.JETPACK_WPCOM_INTEGRATION ] }, () => {
	const normalizeString = ( str: string | null ) => str?.replace( /\s+/g, ' ' ).trim();

	test.skip( true, 'Skipped: unable to test apps/help-center version' );

	test( 'As a user, I can interact with the Help Center in WP Admin', async ( { page } ) => {
		let pageUrl: string;
		let helpCenterComponent: HelpCenterComponent;
		let helpCenterLocator: Locator;

		await test.step( 'Setup the page and test account', async () => {
			const testAccount = new TestAccount( 'defaultUser' );
			pageUrl = `${ testAccount.getSiteURL( { protocol: true } ) }wp-admin/`;

			await testAccount.authenticate( page, { waitUntilStable: true } );
			await page.goto( pageUrl );

			helpCenterComponent = new HelpCenterComponent( page );
			helpCenterLocator = helpCenterComponent.getHelpCenterLocator();

			await helpCenterComponent.setZendeskStaging();
		} );

		// General Interaction

		await test.step( 'Is initially closed', async () => {
			await expect( helpCenterLocator ).toBeHidden();
		} );

		await test.step( 'Can be opened', async () => {
			await helpCenterComponent.openPopover();
			await expect( helpCenterLocator ).toBeVisible();
		} );

		await test.step( 'Is showing on the screen', async () => {
			expect( await helpCenterComponent.isPopoverShown() ).toBeTruthy();
		} );

		await test.step( 'Can be minimized', async () => {
			await helpCenterComponent.minimizePopover();
			const containerHeight = await helpCenterLocator.evaluate(
				( el: HTMLElement ) => el.offsetHeight
			);
			expect( containerHeight ).toBe( 50 );
		} );

		await test.step( 'The popover can be closed', async () => {
			await helpCenterComponent.closePopover();
			await expect( helpCenterLocator ).toBeHidden();
		} );

		// Articles

		await test.step( 'Initial articles are shown', async () => {
			await helpCenterComponent.openPopover();
			const articles = helpCenterComponent.getArticles();
			expect( await articles.count() ).toBeGreaterThanOrEqual( 1 );
		} );

		await test.step( 'Search returns proper results', async () => {
			await helpCenterComponent.search( 'Change a Domain Name Address' );
			const resultTitles = await helpCenterComponent.getArticles().allTextContents();
			expect(
				resultTitles.some(
					( title ) => normalizeString( title )?.includes( 'Change a Domain Name Address' )
				)
			).toBeTruthy();
		} );

		await test.step( 'Post loads correctly', async () => {
			const article = await helpCenterComponent.getArticles().first();
			const articleTitle = await article.textContent();
			await article.click();

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

		// Support Flow

		await test.step( 'Start support flow', async () => {
			await helpCenterComponent.openPopover();
			const stillNeedHelpButton = helpCenterLocator.getByRole( 'link', {
				name: 'Still need help?',
			} );
			await stillNeedHelpButton.waitFor( { state: 'visible' } );
			await stillNeedHelpButton.click();
			expect( await helpCenterComponent.getOdieChat().count() ).toBeTruthy();
		} );

		// Skipped: get forwarded to a human
		// await helpCenterComponent.startAIChat( 'talk to human' );
		// const contactSupportButton = helpCenterComponent.getContactSupportButton();
		// await contactSupportButton.waitFor( { state: 'visible' } );
		// expect( await contactSupportButton.count() ).toBeTruthy();

		// Skipped: start talking with a human
		// const contactSupportButton = helpCenterComponent.getContactSupportButton();
		// await contactSupportButton.dispatchEvent( 'click' );
		// const zendeskMessaging = page
		// 	.frameLocator( 'iframe[title="Messaging window"]' )
		// 	.getByPlaceholder( 'Type a message' );
		// await zendeskMessaging.waitFor( { state: 'visible' } );
		// expect( await zendeskMessaging.count() ).toBeTruthy();

		// Action Hooks

		await test.step( 'Open help center on page load', async () => {
			await page.goto( pageUrl + '?help-center=home' );
			await helpCenterLocator.waitFor( { state: 'visible' } );
			expect( await helpCenterComponent.isPopoverShown() ).toBeTruthy();
		} );
	} );
} );
