/**
 * @group calypso-release
 */

import { DataHelper, LoginPage, setupHooks } from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Woo Installer: Free' ), () => {
	let page: Page;
	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Login', () => {
		// const username = 'e2eflowtestingwoofree';
	} );

	describe( 'Landing page', () => {
		const landing = new WooLandingPage( page );
		it( 'Navigate to landing page', async () => await landing.visit() );
		it( 'Click on the CTA', async () => await landing.cta() );
		it( 'Redirects to the installer', async () => await landing.redirectComplete() );
	} );
} );
