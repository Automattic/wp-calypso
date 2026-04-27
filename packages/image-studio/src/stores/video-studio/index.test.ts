/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order */
import type { VideoStudioState } from './index';

// Mock @wordpress/data
jest.mock( '@wordpress/data', () => ( {
	createReduxStore: jest.fn( ( storeName: string, config: Record< string, unknown > ) => ( {
		name: storeName,
		...config,
	} ) ),
	register: jest.fn(),
	select: jest.fn( () => null ),
} ) );

// Import store module after mocks are set up — must come after jest.mock
import { store as videoStudioStore } from './index';

describe( 'Video Studio Store', () => {
	const { reducer, actions, selectors } = videoStudioStore as any;

	const getInitialState = (): VideoStudioState => {
		return reducer( undefined, { type: '@@INIT' } as any );
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Initial State', () => {
		it( 'has correct default values', () => {
			const state = getInitialState();

			expect( state ).toEqual( {
				selectedStyle: null,
				selectedTone: null,
				currentVideoUrl: null,
			} );
		} );
	} );

	describe( 'Actions', () => {
		it( 'setSelectedStyle creates action with payload', () => {
			const action = actions.setSelectedStyle( 'cinematic' );

			expect( action ).toEqual( {
				type: 'SET_SELECTED_STYLE',
				payload: 'cinematic',
			} );
		} );

		it( 'setSelectedTone creates action with payload', () => {
			const action = actions.setSelectedTone( 'informative' );

			expect( action ).toEqual( {
				type: 'SET_SELECTED_TONE',
				payload: 'informative',
			} );
		} );

		it( 'setCurrentVideoUrl creates action with payload', () => {
			const action = actions.setCurrentVideoUrl( 'https://example.com/clip.mp4' );

			expect( action ).toEqual( {
				type: 'SET_CURRENT_VIDEO_URL',
				payload: 'https://example.com/clip.mp4',
			} );
		} );

		it( 'allows null payloads to clear values', () => {
			expect( actions.setSelectedStyle( null ).payload ).toBeNull();
			expect( actions.setSelectedTone( null ).payload ).toBeNull();
			expect( actions.setCurrentVideoUrl( null ).payload ).toBeNull();
		} );
	} );

	describe( 'Reducer', () => {
		it( 'SET_SELECTED_STYLE updates selectedStyle', () => {
			const state = reducer( getInitialState(), actions.setSelectedStyle( 'documentary' ) );

			expect( state.selectedStyle ).toBe( 'documentary' );
			// Other slices untouched
			expect( state.selectedTone ).toBeNull();
			expect( state.currentVideoUrl ).toBeNull();
		} );

		it( 'SET_SELECTED_TONE updates selectedTone', () => {
			const state = reducer( getInitialState(), actions.setSelectedTone( 'promotional' ) );

			expect( state.selectedTone ).toBe( 'promotional' );
			expect( state.selectedStyle ).toBeNull();
			expect( state.currentVideoUrl ).toBeNull();
		} );

		it( 'SET_CURRENT_VIDEO_URL updates currentVideoUrl', () => {
			const state = reducer(
				getInitialState(),
				actions.setCurrentVideoUrl( 'https://example.com/clip.mp4' )
			);

			expect( state.currentVideoUrl ).toBe( 'https://example.com/clip.mp4' );
			expect( state.selectedStyle ).toBeNull();
			expect( state.selectedTone ).toBeNull();
		} );

		it( 'returns the same reference for unknown action types', () => {
			const initial = getInitialState();
			const next = reducer( initial, { type: 'UNKNOWN_ACTION' } as any );

			expect( next ).toBe( initial );
		} );

		it( 'preserves existing slices when updating one slice', () => {
			let state = reducer( getInitialState(), actions.setSelectedStyle( 'aerial' ) );
			state = reducer( state, actions.setSelectedTone( 'informative' ) );
			state = reducer( state, actions.setCurrentVideoUrl( 'https://example.com/clip.mp4' ) );

			expect( state ).toEqual( {
				selectedStyle: 'aerial',
				selectedTone: 'informative',
				currentVideoUrl: 'https://example.com/clip.mp4',
			} );
		} );

		it( 'allows clearing values back to null', () => {
			let state = reducer( getInitialState(), actions.setSelectedStyle( 'aerial' ) );
			state = reducer( state, actions.setSelectedStyle( null ) );

			expect( state.selectedStyle ).toBeNull();
		} );
	} );

	describe( 'Selectors', () => {
		it( 'getSelectedStyle returns the selected style', () => {
			const state: VideoStudioState = { ...getInitialState(), selectedStyle: 'cinematic' };
			expect( selectors.getSelectedStyle( state ) ).toBe( 'cinematic' );
		} );

		it( 'getSelectedTone returns the selected tone', () => {
			const state: VideoStudioState = { ...getInitialState(), selectedTone: 'informative' };
			expect( selectors.getSelectedTone( state ) ).toBe( 'informative' );
		} );

		it( 'getCurrentVideoUrl returns the current video URL', () => {
			const state: VideoStudioState = {
				...getInitialState(),
				currentVideoUrl: 'https://example.com/clip.mp4',
			};
			expect( selectors.getCurrentVideoUrl( state ) ).toBe( 'https://example.com/clip.mp4' );
		} );

		it( 'all selectors return null on the initial state', () => {
			const state = getInitialState();
			expect( selectors.getSelectedStyle( state ) ).toBeNull();
			expect( selectors.getSelectedTone( state ) ).toBeNull();
			expect( selectors.getCurrentVideoUrl( state ) ).toBeNull();
		} );
	} );

	describe( 'Store configuration', () => {
		it( 'exports store with correct structure', () => {
			expect( videoStudioStore ).toBeDefined();
			expect( videoStudioStore.name ).toBe( 'video-studio' );
			expect( typeof videoStudioStore.reducer ).toBe( 'function' );
			expect( typeof videoStudioStore.actions ).toBe( 'object' );
			expect( typeof videoStudioStore.selectors ).toBe( 'object' );
		} );
	} );
} );
