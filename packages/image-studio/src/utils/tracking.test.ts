import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	detectPlatform,
	resetPlatformCache,
	trackImageStudioOpened,
	trackImageStudioClosed,
} from './tracking';

// Mock @automattic/calypso-analytics
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

// Mock @wordpress/data
jest.mock( '@wordpress/data', () => ( {
	select: jest.fn(),
	createReduxStore: jest.fn(),
	register: jest.fn(),
} ) );

const mockedRecordTracksEvent = recordTracksEvent as jest.MockedFunction<
	typeof recordTracksEvent
>;

describe( 'detectPlatform', () => {
	beforeEach( () => {
		resetPlatformCache();
		delete ( window as any ).bigSkyInitialState;
	} );

	it( 'returns "wpcom" when bigSkyInitialState is present', () => {
		( window as any ).bigSkyInitialState = { currentScreen: { screen: 'post' } };
		expect( detectPlatform() ).toBe( 'wpcom' );
	} );

	it( 'returns "jetpack" when bigSkyInitialState is absent', () => {
		expect( detectPlatform() ).toBe( 'jetpack' );
	} );

	it( 'caches the result across calls', () => {
		( window as any ).bigSkyInitialState = { currentScreen: { screen: 'post' } };
		expect( detectPlatform() ).toBe( 'wpcom' );

		// Remove the signal — should still return cached value
		delete ( window as any ).bigSkyInitialState;
		expect( detectPlatform() ).toBe( 'wpcom' );
	} );

	it( 'returns fresh value after cache reset', () => {
		expect( detectPlatform() ).toBe( 'jetpack' );

		resetPlatformCache();

		( window as any ).bigSkyInitialState = { currentScreen: { screen: 'post' } };
		expect( detectPlatform() ).toBe( 'wpcom' );
	} );
} );

describe( 'tracks event prefix', () => {
	beforeEach( () => {
		resetPlatformCache();
		mockedRecordTracksEvent.mockClear();
		delete ( window as any ).bigSkyInitialState;
	} );

	it( 'uses wpcom_ prefix when Big Sky is active', () => {
		( window as any ).bigSkyInitialState = { currentScreen: { screen: 'post' } };
		trackImageStudioOpened( { mode: 'generate' as any } );
		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'wpcom_image_studio_opened',
			expect.any( Object )
		);
	} );

	it( 'uses jetpack_ prefix when Big Sky is not active', () => {
		trackImageStudioOpened( { mode: 'edit' as any } );
		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_image_studio_opened',
			expect.any( Object )
		);
	} );

	it( 'uses correct prefix for events going through recordImageStudioEvent', () => {
		trackImageStudioClosed( { mode: 'edit' as any } );
		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_image_studio_closed',
			expect.any( Object )
		);
	} );

	it( 'uses wpcom_ prefix for events going through recordImageStudioEvent', () => {
		( window as any ).bigSkyInitialState = { currentScreen: { screen: 'post' } };
		trackImageStudioClosed( { mode: 'generate' as any } );
		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'wpcom_image_studio_closed',
			expect.any( Object )
		);
	} );
} );
