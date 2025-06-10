/**
 * @group calypso-pr
 */

import {
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
	envVariables,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

const A4A_URL = 'https://agencies.automattic.com';

/**
 * Verify the A4A > Signup page loads
 */
describe( 'A4A > Signup: Smoke Test', function () {
	let page: Page;
	const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );
	const testAccount = new TestAccount( accountName );

	beforeAll( async function () {
		page = await browser.newPage();
		await testAccount.authenticate( page );
	} );

	it( 'Navigate to A4A > Signup', async function () {
		await page.goto( `${ A4A_URL }/signup` );

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
