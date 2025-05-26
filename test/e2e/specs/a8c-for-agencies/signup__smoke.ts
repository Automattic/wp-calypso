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
		await page.getByLabel( 'Your first name' ).fill( firstName );

		// Enter last name
		const lastName = 'Doe';
		await page.getByLabel( 'Last name' ).fill( lastName );

		// Enter email address
		const email = 'johndoe@example.com';
		await page.getByLabel( 'Email' ).fill( email );

		// Enter the agency name
		const agencyName = 'Agency Name';
		await page.getByLabel( 'Agency name' ).fill( agencyName );

		// Enter the business URL
		const businessURL = 'https://example.com';
		await page.getByLabel( 'Business URL' ).fill( businessURL );

		// Phone number
		const phoneNumber = '+1234567890';
		await page.getByLabel( 'Phone number' ).fill( phoneNumber );

		// Enter Country code combobox
		await page
			.getByRole( 'combobox', { name: 'Country code' } )
			.selectOption( { label: 'United States (+1)' } );

		// Verify the form values
		expect( await page.getByLabel( 'Your first name' ).inputValue() ).toBe( firstName );
		expect( await page.getByLabel( 'Last name' ).inputValue() ).toBe( lastName );
		expect( await page.getByLabel( 'Email' ).inputValue() ).toBe( email );
		expect( await page.getByLabel( 'Phone number' ).inputValue() ).toBe( phoneNumber );
		expect( await page.getByLabel( 'Agency name' ).inputValue() ).toBe( agencyName );
		expect( await page.getByLabel( 'Business URL' ).inputValue() ).toBe( businessURL );
		expect( await page.getByRole( 'combobox', { name: 'Country code' } ).inputValue() ).toBe(
			'+1'
		);

		// Click the "Continue for free" button
		await page.getByRole( 'button', { name: 'Continue for free' } ).click();
		await page.waitForURL( `${ A4A_URL }/signup/agency` );

		/*	// Select the user type to site owner
		await page
			.getByRole( 'combobox', { name: 'How would you describe yourself?' } )
			.selectOption( { label: "I do not work at an agency. I'm a site owner." } );

		// Verify the message is displayed
		const message = await page.$(
			'text=It seems like we might not be the perfect match right now.'
		);
		expect( message ).not.toBeNull();

		// Select the user type to agency owner
		await page
			.getByRole( 'combobox', { name: 'How would you describe yourself?' } )
			.selectOption( { label: "I'm an agency owner" } );

		// Select the number of managed sites
		await page
			.getByRole( 'combobox', { name: 'How many sites do you manage?' } )
			.selectOption( { label: '6-20' } );

		// Select the services offered
		await page.getByRole( 'checkbox', { name: 'Strategy Consulting' } ).check();

		// Select the products offered
		await page.getByRole( 'checkbox', { name: 'WordPress.com' } ).check();

		// Enter the address
		await page.getByPlaceholder( 'Street name and house number' ).fill( '123 Main St' );
		await page.getByPlaceholder( 'Apartment, floor, suite or unit number' ).fill( 'Suite 101' );
		await page.getByLabel( 'City' ).fill( 'San Francisco' );
		await page.getByLabel( 'Postal code' ).fill( '94105' );

		// Verify the form values

		expect(
			await page.getByRole( 'combobox', { name: 'How would you describe yourself?' } ).inputValue()
		).toBe( 'agency_owner' );
		expect(
			await page.getByRole( 'combobox', { name: 'How many sites do you manage?' } ).inputValue()
		).toBe( '6-20' );
		expect( await page.getByRole( 'checkbox', { name: 'Strategy Consulting' } ).isChecked() ).toBe(
			true
		);
		expect( await page.getByRole( 'checkbox', { name: 'WordPress.com' } ).isChecked() ).toBe(
			true
		);
		expect( await page.getByPlaceholder( 'Street name and house number' ).inputValue() ).toBe(
			'123 Main St'
		);
		expect(
			await page.getByPlaceholder( 'Apartment, floor, suite or unit number' ).inputValue()
		).toBe( 'Suite 101' );
		expect( await page.getByLabel( 'City' ).inputValue() ).toBe( 'San Francisco' );
		expect( await page.getByLabel( 'Postal code' ).inputValue() ).toBe( '94105' );
		*/
	} );
} );
