import { DataHelper } from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe( 'Server-side Rendering', { tag: [ tags.CALYPSO_PR ] }, () => {
	for ( const endpoint of [ 'log-in', 'themes', 'theme/twentytwentythree' ] ) {
		test( `Check SSR endpoint: ${ endpoint }`, async ( { page } ) => {
			// The marker this asserts on is in the server response, so stop at
			// `domcontentloaded`. The theme endpoint mounts a live block-preview
			// iframe and a dozen other frames, and the default `load` waits on
			// every one of them before the assertion the test cares about.
			await page.goto( DataHelper.getCalypsoURL( endpoint ), {
				waitUntil: 'domcontentloaded',
				timeout: 20 * 1000,
			} );
			await page.locator( '#wpcom[data-calypso-ssr="true"]' ).waitFor( { timeout: 15 * 1000 } );
		} );
	}
} );
