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

	describe( 'Installer redirects to start of flow', () => {
		const installer = new WooInstaller( page );
		it( 'Loads confirm step', async () => {
			await installer.enterFlow();
			await installer.confirmLoads();
		} );
	} );

	describe( 'Installer redirects to start of flow', () => {
		const installer = new WooInstaller( page );
		it( 'Loads confirm step', async () => {
			await installer.enterFlow();
			await installer.confirmLoads();
		} );
	} );
} );
