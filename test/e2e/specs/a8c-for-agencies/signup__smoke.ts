/**
 * @group a8c-for-agencies
 */

import { envVariables } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

/**
 * Verify the A4A > Signup page loads
 */
describe( 'A4A > Signup: Smoke Test', function () {
	let page: Page;

	beforeAll( async function () {
		page = await browser.newPage();
	} );

	it( 'Navigate to A4A > Signup', async function () {
		await page.goto( `${ envVariables.A8C_FOR_AGENCIES_URL }/signup` );

		// Enter first name
		const firstName = 'John';
		await page.getByPlaceholder( 'Your first name' ).fill( firstName );

		// Enter last name
		const lastName = 'Doe';
		await page.getByPlaceholder( 'Your last name' ).fill( lastName );

		// Enter the agency name
		const agencyName = 'Agency name';
		await page.getByPlaceholder( 'Agency name' ).fill( agencyName );

		// Enter the business URL
		const businessURL = 'https://example.com';
		await page.getByPlaceholder( 'Business URL' ).fill( businessURL );

		// Verify the form values
		expect( await page.getByPlaceholder( 'Your first name' ).inputValue() ).toBe( firstName );
		expect( await page.getByPlaceholder( 'Your last name' ).inputValue() ).toBe( lastName );
		expect( await page.getByPlaceholder( 'Business URL' ).inputValue() ).toBe( businessURL );
	} );
} );
