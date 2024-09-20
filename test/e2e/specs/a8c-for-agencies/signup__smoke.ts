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
 * Verifies the A4A > Signup page loads
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
		await page.fill( 'input[name="firstName"]', firstName );

		// Enter last name
		const lastName = 'Doe';
		await page.fill( 'input[name="lastName"]', lastName );

		// Enter the agency name
		const agencyName = 'Agency Name';
		await page.fill( 'input[name="agencyName"]', agencyName );

		// Enter the business URL
		const businessURL = 'https://example.com';
		await page.fill( 'input[name="agencyUrl"]', businessURL );

		// Select the number of managed sites
		await page.selectOption( 'select[name="managed_sites"]', { value: '6-20' } );

		// Select the services offered
		await page.click( 'input[name="services_offered[]"][value="strategy_consulting"]' );

		// Select the products offered
		await page.click( 'input[name="products_offered[]"][value="WordPress.com"]' );

		// Enter the address
		await page.fill( 'input[name="line1"]', '123 Main St' );
		await page.fill( 'input[name="line2"]', 'Suite 101' );
		await page.fill( 'input[name="city"]', 'San Francisco' );
		await page.fill( 'input[name="postalCode"]', '94105' );

		// Select the country
		await page.fill(
			'input[id="components-form-token-input-combobox-control-0"]',
			'United States'
		);

		// Verify the form values
		const firstNameValue = await page.inputValue( 'input[name="firstName"]' );
		expect( firstNameValue ).toBe( firstName );

		const lastNameValue = await page.inputValue( 'input[name="lastName"]' );
		expect( lastNameValue ).toBe( lastName );

		const agencyNameValue = await page.inputValue( 'input[name="agencyName"]' );
		expect( agencyNameValue ).toBe( agencyName );

		const businessURLValue = await page.inputValue( 'input[name="agencyUrl"]' );
		expect( businessURLValue ).toBe( businessURL );

		const managedSitesValue = await page.inputValue( 'select[name="managed_sites"]' );
		expect( managedSitesValue ).toBe( '6-20' );

		const servicesOfferedValue = await page.inputValue(
			'input[name="services_offered[]"][value="strategy_consulting"]'
		);
		expect( servicesOfferedValue ).toBe( 'strategy_consulting' );

		const productsOfferedValue = await page.inputValue(
			'input[name="products_offered[]"][value="WordPress.com"]'
		);
		expect( productsOfferedValue ).toBe( 'WordPress.com' );

		const countryValue = await page.inputValue(
			'input[id="components-form-token-input-combobox-control-0"]'
		);
		expect( countryValue ).toBe( 'United States' );
	} );
} );
