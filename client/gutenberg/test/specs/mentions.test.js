/**
 * Internal dependencies
 */
import {
	newPost,
	getEditedPostContent,
	clickBlockAppender,
} from '../support/utils';

describe( 'autocomplete mentions', () => {
	beforeAll( async () => {
		await newPost();
	} );

	it( 'should insert mention', async () => {
		await clickBlockAppender();
		await page.keyboard.type( 'I am @a' );
		await page.waitForSelector( '.components-autocomplete__result' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( '.' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );
