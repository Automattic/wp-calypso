import { DataHelper } from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

const endpoints = [ 'log-in', 'themes', 'theme/twentytwentythree' ];

for ( const endpoint of endpoints ) {
	test.describe( `Server-side Rendering: ${ endpoint }`, { tag: [ tags.CALYPSO_PR ] }, () => {
		test( `Given the Calypso endpoint ${ endpoint } When the page loads Then it should be server-side rendered`, async ( {
			page,
		} ) => {
			await page.goto( DataHelper.getCalypsoURL( endpoint ), { timeout: 20 * 1000 } );
			await page.locator( '#wpcom[data-calypso-ssr="true"]' ).waitFor( { timeout: 15 * 1000 } );
		} );
	} );
}
