import { DataHelper } from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe( 'Server-side Rendering', { tag: [ tags.CALYPSO_PR ] }, () => {
	for ( const endpoint of [ 'log-in', 'themes', 'theme/twentytwentythree' ] ) {
		test( `Check SSR endpoint: ${ endpoint }`, async ( { page } ) => {
			await page.goto( DataHelper.getCalypsoURL( endpoint ), { timeout: 20 * 1000 } );
			await page.locator( '#wpcom[data-calypso-ssr="true"]' ).waitFor( { timeout: 15 * 1000 } );
		} );
	}
} );
