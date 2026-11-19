/**
 * @jest-environment jsdom
 */

import type * as BilmurSpaModule from '../module';

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

let mockFeatures: string[];
let mockBeaconOrigin: string;
let mockModuleUrl: string;

jest.mock( '@automattic/calypso-config', () => {
	const config = ( key: string ) => ( key === 'bilmur_spa_url' ? mockModuleUrl : mockBeaconOrigin );
	config.isEnabled = ( feature: string ) => mockFeatures.includes( feature );
	return { __esModule: true, default: config };
} );

describe( 'bilmur-spa module', () => {
	let lib: typeof BilmurSpaModule;
	let module: { init: jest.Mock };
	let importModule: jest.Mock;

	beforeEach( async () => {
		// The library keeps its state at the module level.
		jest.resetModules();
		lib = await import( '../module' );
		module = { init: jest.fn() };
		importModule = jest.fn().mockResolvedValue( module );
		mockFeatures = [ 'bilmur-spa' ];
		mockBeaconOrigin = '';
		mockModuleUrl = 'https://example.com/bilmur-spa.min.js';
		document.head.innerHTML = '<meta id="bilmur" data-provider="wordpress.com" />';
	} );

	afterEach( () => {
		jest.useRealTimers();
		document.head.innerHTML = '';
	} );

	it( 'imports the module with a weekly cache buster and initializes it', async () => {
		jest.useFakeTimers().setSystemTime( 3 * ONE_WEEK + 1000 );

		await lib.loadBilmurSpa( importModule );

		expect( importModule ).toHaveBeenCalledWith( 'https://example.com/bilmur-spa.min.js?w=3' );
		expect( module.init ).toHaveBeenCalledWith( { beaconOrigin: undefined } );
	} );

	it( 'imports the module from the origin of the page when its URL is relative', async () => {
		mockModuleUrl = '/wp-content/js/bilmur-spa.min.js';

		await lib.loadBilmurSpa( importModule );

		expect( importModule ).toHaveBeenCalledWith(
			expect.stringContaining( `${ window.location.origin }/wp-content/js/bilmur-spa.min.js?w=` )
		);
	} );

	it( 'imports nothing when the feature is disabled', async () => {
		mockFeatures = [];

		await lib.loadBilmurSpa( importModule );

		expect( importModule ).not.toHaveBeenCalled();
	} );

	it( 'imports nothing when the server left the configuration out of the document', async () => {
		document.head.innerHTML = '';

		await lib.loadBilmurSpa( importModule );

		expect( importModule ).not.toHaveBeenCalled();
	} );

	it( 'has the module report to the origin of the page when the beacon origin is /', async () => {
		mockBeaconOrigin = '/';

		await lib.loadBilmurSpa( importModule );

		expect( module.init ).toHaveBeenCalledWith( { beaconOrigin: window.location.origin } );
	} );

	it( 'leaves the app alone when the module fails to load', async () => {
		importModule.mockRejectedValue( new Error( 'blocked' ) );

		await expect( lib.loadBilmurSpa( importModule ) ).resolves.toBeUndefined();
		expect( () => lib.startNavigation( '/sites', '/sites', {} ) ).not.toThrow();
	} );
} );
