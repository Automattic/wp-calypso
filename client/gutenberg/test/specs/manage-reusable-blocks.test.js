/**
 * Node dependencies
 */
import path from 'path';

/**
 * Internal dependencies
 */
import { visitAdmin } from '../support/utils';

describe( 'Managing reusable blocks', () => {
	beforeAll( async () => {
		await visitAdmin( 'edit.php', 'post_type=wp_block' );
	} );

	it( 'Should import reusable blocks', async () => {
		// Import Reusable block
		await page.waitForSelector( '.list-reusable-blocks__container' );
		const importButton = await page.$( '.list-reusable-blocks__container button' );
		await importButton.click();

		// Select the file to upload
		const testReusableBlockFile = path.join( __dirname, '..', 'assets', 'greeting-reusable-block.json' );
		const input = await page.$( '.list-reusable-blocks-import-form input' );
		await input.uploadFile( testReusableBlockFile );

		// Submit the form
		const button = await page.$( '.list-reusable-blocks-import-form__button' );
		await button.click();

		// Wait for the success notice
		await page.waitForSelector( '.notice-success' );
		const noticeContent = await page.$eval( '.notice-success', ( element ) => element.textContent );
		expect( noticeContent ).toEqual( 'Reusable block imported successfully!' );

		// Refresh the page
		await visitAdmin( 'edit.php', 'post_type=wp_block' );

		// The reusable block has been imported
		page.waitForXPath( 'div[@class="post_title"][contains(text(), "Greeting")]' );
	} );
} );
