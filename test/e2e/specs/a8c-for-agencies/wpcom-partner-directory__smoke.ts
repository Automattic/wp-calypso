/**
 * @group gutenberg
 */

import type { Browser, Page } from 'playwright';

declare const browser: Browser;

/**
 * Verify the WordPress.com Partner Directory page loads and is interactive.
 */
describe( 'Automattic For Agencies: WordPress.com Partner Directory', () => {
	let page: Page;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	test( 'Navigate to the WordPress.com Partner Directory', async () => {
		await page.goto( 'https://wordpress.com/development-services/' );
	} );

	test( 'Click the Industries dropdown', async () => {
		await page.getByRole( 'button', { name: 'Industries' } ).click();
	} );

	test( 'Select the Legal & Professional Services industry', async () => {
		await page.getByRole( 'checkbox', { name: 'Legal & Professional Services' } ).click();
	} );

	test( 'Wait for the filter to be applied', async () => {
		await page.waitForSelector( 'text=/\\d+ partners found for filters/', { timeout: 10000 } );
	} );

	test( "Visit the first partner's details page", async () => {
		await Promise.all( [
			page.getByText( 'Accepting new clients' ).first().click(),
			page.waitForURL( /https:\/\/wordpress\.com\/development-services\/[^/]+\/[^/]+\//, {
				timeout: 10_000,
			} ),
		] );
	} );
} );
