/**
 * @jest-environment jsdom
 */
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { showOdie } from '../';
import { getHotjarSiteSettings, mayWeLoadHotJarScript } from '../../analytics/hotjar';

jest.mock( 'calypso/lib/jetpack/is-jetpack-cloud' );

describe( 'index', () => {
	test( 'Should call showOdie with hotjarSiteSettings', async () => {
		global.window.Odie = {};
		let mockOdieMockCall = null;

		global.window.Odie.render = jest.fn( ( args ) => {
			mockOdieMockCall = args;
			args.onLoaded();
		} );

		isJetpackCloud.mockReturnValue( true );
		const jetpackCloudEnableReturn = {
			...getHotjarSiteSettings(),
			isEnabled: mayWeLoadHotJarScript(),
		};

		await showOdie( 'foo' );
		expect( mockOdieMockCall.hotjarSiteSettings ).toEqual( jetpackCloudEnableReturn );

		isJetpackCloud.mockReturnValue( false );
		const jetpackCloudDisableReturn = {
			...getHotjarSiteSettings(),
			isEnabled: mayWeLoadHotJarScript(),
		};

		await showOdie( 'foo' );
		expect( mockOdieMockCall.hotjarSiteSettings ).toEqual( jetpackCloudDisableReturn );

		expect( jetpackCloudEnableReturn ).not.toEqual( jetpackCloudDisableReturn );
	} );
} );
