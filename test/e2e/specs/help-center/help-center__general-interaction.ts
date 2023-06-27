/**
 * @group calypso-pr
 */

import { SupportComponent, TestAccount } from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

/**
 * Tests interaction with the Help Centre, simulating a user
 * looking for information on a specific topic, going through
 * help doccs and the Calypso links.
 */
describe( 'Help Center: Interact with Results', function () {
	let page: Page;
	let supportComponent: SupportComponent;

	beforeAll( async function () {
		page = await browser.newPage();

		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );

		supportComponent = new SupportComponent( page );
		await page.waitForLoadState( 'networkidle' );
	} );

	describe( 'Search for Help article', function () {
		it( 'Open Help Center', async function () {
			await supportComponent.openPopover();
		} );

		it( 'Search for domain-related help article', async function () {
			await supportComponent.search( 'domain' );
		} );

		it( 'Click on the second Help Docs result', async function () {
			await supportComponent.clickResultByIndex( 'Docs', 1 );
		} );

		it( 'Help Doc article is shown', async function () {
			const articleTitle = await supportComponent.getOpenArticleTitle();
			expect( articleTitle ).not.toBe( '' );
		} );
	} );

	describe( 'Navigate to Calypso Link', function () {
		it( 'Close article and return to search results', async function () {
			await supportComponent.goBack();
		} );

		it( 'Search for "domain"', async function () {
			await supportComponent.search( 'domain' );
		} );

		it( 'Click on the first Calypso Link result', async function () {
			await supportComponent.clickResultByIndex( 'Calypso Link', 0 );
		} );

		it( 'Calypso Link opens in a new page', async function () {
			await page.waitForEvent( 'popup' );
		} );
	} );
} );
