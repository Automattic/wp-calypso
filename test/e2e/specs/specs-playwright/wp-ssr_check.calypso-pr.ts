import { setupHooks, DataHelper } from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Server-side Rendering' ), function () {
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it.each`
		endpoint
		${ DataHelper.getCalypsoURL( 'log-in' ) }
		${ DataHelper.getCalypsoURL( 'themes' ) }
		${ DataHelper.getCalypsoURL( 'theme/twentytwenty' ) }
	`( 'Check endpoint: $endpoint', async function ( { endpoint } ) {
		await page.goto( endpoint );
		await page.waitForSelector( '#wpcom[data-calypso-ssr="true"]' );
	} );
} );
