import { test } from '../../lib/pw-base';

test.describe( 'Test group', () => {
	test( 'seed', async ( { page, accountP2User, pageP2 } ) => {
		await accountP2User.authenticate( page );
		await page.goto( accountP2User.getSiteURL() );
		await pageP2.clickNewPost();
		// generate code here.
	} );
} );
