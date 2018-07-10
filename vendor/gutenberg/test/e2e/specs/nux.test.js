/**
 * Internal dependencies
 */
import '../support/bootstrap';
import { newDesktopBrowserPage, newPost } from '../support/utils';

describe( 'NUX', () => {
	it( 'should show tips to a first-time user', async () => {
		await newDesktopBrowserPage();
		await newPost( undefined, false );

		const firstTipText = await page.$eval( '.nux-dot-tip', ( element ) => element.innerText );
		expect( firstTipText ).toContain( 'Welcome to the wonderful world of blocks!' );

		const [ nextTipButton ] = await page.$x( '//button[contains(text(), \'See next tip\')]' );
		await nextTipButton.click();

		const secondTipText = await page.$eval( '.nux-dot-tip', ( element ) => element.innerText );
		expect( secondTipText ).toContain( 'You’ll find more settings for your page and blocks in the sidebar.' );
	} );
} );
