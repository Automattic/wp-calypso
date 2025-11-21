/**
 * @group gutenberg
 */

import { envVariables } from '@automattic/calypso-e2e';
import type { Browser, Page } from 'playwright';
declare const browser: Browser;

/**
 * Verify the Partner Directory page loads and is interactive.
 */
describe( 'Automattic For Agencies: Partner Directory', () => {
	let page: Page;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	test( 'Navigate to the Partner Directory', async () => {
		await page.goto( envVariables.PARTNER_DIRECTORY_BASE_URL );
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
			page.waitForURL( new RegExp( `^${ envVariables.PARTNER_DIRECTORY_BASE_URL }/[^/]+/[^/]+/` ), {
				timeout: 10_000,
			} ),
		] );
	} );
} );
