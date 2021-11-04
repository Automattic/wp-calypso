/**
 * @group calypso-pr
 */

import { DataHelper } from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import { setupHooks } from '../../lib/jest/setup-hooks';

describe( DataHelper.createSuiteTitle( 'Server-side Rendering' ), function () {
	let page: Page;

	setupHooks( ( createdPage ) => {
		page = createdPage;
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
