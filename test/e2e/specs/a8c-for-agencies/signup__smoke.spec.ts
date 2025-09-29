import { test, expect, tags } from '../../lib/pw-base';

/**
 * Verify the A4A > Signup page loads
 */
test.describe( 'Automattic For Agencies: Sign Up Page', { tag: [ tags.A8C_FOR_AGENCIES ] }, () => {
	test( 'As an unauthenticated web agency owner, I can enter my agency details and see these displayed', async ( {
		environment,
		page,
	} ) => {
		const firstName = 'John';
		const lastName = 'Doe';
		const agencyName = 'Agency name';
		const businessURL = 'https://example.com';

		await test.step( 'Given I am on the Automattic For Agencies Sign Up Page', async () => {
			await page.goto( `${ environment.A8C_FOR_AGENCIES_URL }/signup` );
		} );

		await test.step( 'When I enter my first name', async () => {
			await page.getByPlaceholder( 'Your first name' ).fill( firstName );
		} );

		await test.step( 'And I enter my last name', async () => {
			await page.getByPlaceholder( 'Your last name' ).fill( lastName );
		} );

		await test.step( 'And I enter my agency name', async () => {
			await page.getByPlaceholder( 'Agency name' ).fill( agencyName );
		} );

		await test.step( 'And I enter my agency URL', async () => {
			await page.getByPlaceholder( 'Business URL' ).fill( businessURL );
		} );

		await test.step( 'Then the form values display what I have entered', async () => {
			expect( await page.getByPlaceholder( 'Your first name' ).inputValue() ).toBe( firstName );
			expect( await page.getByPlaceholder( 'Your last name' ).inputValue() ).toBe( lastName );
			expect( await page.getByPlaceholder( 'Business URL' ).inputValue() ).toBe( businessURL );
		} );
	} );
} );
