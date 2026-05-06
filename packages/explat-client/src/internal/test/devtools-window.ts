import { installDevtoolsWindow, type DevtoolsSurface } from '../devtools-window';
import { createEvalLog } from '../eval-log';
import { createForcedFeatures, FORCED_FEATURES_STORAGE_KEY } from '../forced-features';
import { polyfilledLocalStorage } from '../local-storage';
import { setBrowserContext } from '../test-common';

function makeDevtools(): DevtoolsSurface {
	return {
		forcedFeatures: createForcedFeatures(),
		evalLog: createEvalLog( 100 ),
		getKnownFlags: () => [],
		getKnownVariations: () => [],
		getFlagInfo: () => null,
		getRawFeature: () => null,
		previewFeatureValue: async () => null,
		getEvaluationAttributes: async () => null,
	};
}

function clearWindowExplat() {
	if ( typeof global.window !== 'undefined' && global.window !== null ) {
		delete ( global.window as unknown as Record< string, unknown > ).__EXPLAT__;
	}
}

describe( 'installDevtoolsWindow', () => {
	beforeEach( () => {
		setBrowserContext();
		polyfilledLocalStorage.removeItem( FORCED_FEATURES_STORAGE_KEY );
		clearWindowExplat();
	} );

	test( 'attaches __EXPLAT__ when isDevelopmentMode is true', () => {
		installDevtoolsWindow( {
			devtools: makeDevtools(),
			isDevelopmentMode: true,
			getRuntimeMode: () => 'normal',
		} );
		const w = global.window as unknown as { __EXPLAT__?: { setForcedFeatures: unknown } };
		expect( w.__EXPLAT__ ).toBeDefined();
		expect( typeof w.__EXPLAT__?.setForcedFeatures ).toBe( 'function' );
	} );

	test( 'attaches __EXPLAT__ when runtime mode is manual_testing', () => {
		installDevtoolsWindow( {
			devtools: makeDevtools(),
			isDevelopmentMode: false,
			getRuntimeMode: () => 'manual_testing',
		} );
		expect( ( global.window as unknown as { __EXPLAT__?: unknown } ).__EXPLAT__ ).toBeDefined();
	} );

	test( 'does NOT attach __EXPLAT__ in normal production for regular users', () => {
		installDevtoolsWindow( {
			devtools: makeDevtools(),
			isDevelopmentMode: false,
			getRuntimeMode: () => 'normal',
		} );
		expect( ( global.window as unknown as { __EXPLAT__?: unknown } ).__EXPLAT__ ).toBeUndefined();
	} );

	test( 'setForcedFeatures accepts a Map of overrides', () => {
		const dev = makeDevtools();
		installDevtoolsWindow( {
			devtools: dev,
			isDevelopmentMode: true,
			getRuntimeMode: () => 'normal',
		} );
		const w = global.window as unknown as {
			__EXPLAT__: { setForcedFeatures: ( m: Map< string, unknown > ) => void };
		};
		w.__EXPLAT__.setForcedFeatures(
			new Map< string, unknown >( [
				[ 'a', 'treatment' ],
				[ 'b', true ],
			] )
		);
		expect( dev.forcedFeatures.get( 'a' ) ).toBe( 'treatment' );
		expect( dev.forcedFeatures.get( 'b' ) ).toBe( true );
	} );

	test( 'setForcedFeatures accepts a plain object', () => {
		const dev = makeDevtools();
		installDevtoolsWindow( {
			devtools: dev,
			isDevelopmentMode: true,
			getRuntimeMode: () => 'normal',
		} );
		const w = global.window as unknown as {
			__EXPLAT__: { setForcedFeatures: ( o: Record< string, unknown > ) => void };
		};
		w.__EXPLAT__.setForcedFeatures( { a: 'treatment' } );
		expect( dev.forcedFeatures.get( 'a' ) ).toBe( 'treatment' );
	} );

	test( 'clearForcedFeatures with no arg clears every override', () => {
		const dev = makeDevtools();
		dev.forcedFeatures.set( 'a', 1 );
		dev.forcedFeatures.set( 'b', 2 );
		installDevtoolsWindow( {
			devtools: dev,
			isDevelopmentMode: true,
			getRuntimeMode: () => 'normal',
		} );
		const w = global.window as unknown as {
			__EXPLAT__: { clearForcedFeatures: ( k?: string ) => void };
		};
		w.__EXPLAT__.clearForcedFeatures();
		expect( dev.forcedFeatures.has( 'a' ) ).toBe( false );
		expect( dev.forcedFeatures.has( 'b' ) ).toBe( false );
	} );

	test( 'clearForcedFeatures(key) clears just that key', () => {
		const dev = makeDevtools();
		dev.forcedFeatures.set( 'a', 1 );
		dev.forcedFeatures.set( 'b', 2 );
		installDevtoolsWindow( {
			devtools: dev,
			isDevelopmentMode: true,
			getRuntimeMode: () => 'normal',
		} );
		const w = global.window as unknown as {
			__EXPLAT__: { clearForcedFeatures: ( k?: string ) => void };
		};
		w.__EXPLAT__.clearForcedFeatures( 'a' );
		expect( dev.forcedFeatures.has( 'a' ) ).toBe( false );
		expect( dev.forcedFeatures.has( 'b' ) ).toBe( true );
	} );
} );
