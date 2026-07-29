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
				selectedStyle: 'cinematic',
				currentVideoUrl: null,
				currentAttachmentId: null,
				currentDurationSeconds: null,
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

		it( 'setCurrentVideoUrl creates action with payload', () => {
			const action = actions.setCurrentVideoUrl( 'https://example.com/clip.mp4' );

			expect( action ).toEqual( {
				type: 'SET_CURRENT_VIDEO_URL',
				payload: 'https://example.com/clip.mp4',
			} );
		} );

		it( 'setCurrentAttachmentId creates action with payload', () => {
			const action = actions.setCurrentAttachmentId( 42 );

			expect( action ).toEqual( {
				type: 'SET_CURRENT_ATTACHMENT_ID',
				payload: 42,
			} );
		} );

		it( 'setCurrentDurationSeconds creates action with payload', () => {
			const action = actions.setCurrentDurationSeconds( 8 );

			expect( action ).toEqual( {
				type: 'SET_CURRENT_DURATION_SECONDS',
				payload: 8,
			} );
		} );

		it( 'allows null payloads to clear values', () => {
			expect( actions.setSelectedStyle( null ).payload ).toBeNull();
			expect( actions.setCurrentVideoUrl( null ).payload ).toBeNull();
			expect( actions.setCurrentAttachmentId( null ).payload ).toBeNull();
			expect( actions.setCurrentDurationSeconds( null ).payload ).toBeNull();
		} );
	} );

	describe( 'Reducer', () => {
		it( 'SET_SELECTED_STYLE updates selectedStyle', () => {
			const state = reducer( getInitialState(), actions.setSelectedStyle( 'cinematic' ) );

			expect( state.selectedStyle ).toBe( 'cinematic' );
			// Other slices untouched
			expect( state.currentVideoUrl ).toBeNull();
		} );

		it( 'SET_CURRENT_VIDEO_URL updates currentVideoUrl', () => {
			const state = reducer(
				getInitialState(),
				actions.setCurrentVideoUrl( 'https://example.com/clip.mp4' )
			);

			expect( state.currentVideoUrl ).toBe( 'https://example.com/clip.mp4' );
			expect( state.selectedStyle ).toBe( 'cinematic' );
			expect( state.currentAttachmentId ).toBeNull();
			expect( state.currentDurationSeconds ).toBeNull();
		} );

		it( 'SET_CURRENT_ATTACHMENT_ID updates currentAttachmentId', () => {
			const state = reducer( getInitialState(), actions.setCurrentAttachmentId( 123 ) );

			expect( state.currentAttachmentId ).toBe( 123 );
			expect( state.currentVideoUrl ).toBeNull();
			expect( state.currentDurationSeconds ).toBeNull();
		} );

		it( 'SET_CURRENT_DURATION_SECONDS updates currentDurationSeconds', () => {
			const state = reducer( getInitialState(), actions.setCurrentDurationSeconds( 12 ) );

			expect( state.currentDurationSeconds ).toBe( 12 );
			expect( state.currentVideoUrl ).toBeNull();
			expect( state.currentAttachmentId ).toBeNull();
		} );

		it( 'returns the same reference for unknown action types', () => {
			const initial = getInitialState();
			const next = reducer( initial, { type: 'UNKNOWN_ACTION' } as any );

			expect( next ).toBe( initial );
		} );

		it( 'preserves existing slices when updating one slice', () => {
			let state = reducer( getInitialState(), actions.setSelectedStyle( 'cinematic' ) );
			state = reducer( state, actions.setCurrentVideoUrl( 'https://example.com/clip.mp4' ) );
			state = reducer( state, actions.setCurrentAttachmentId( 7 ) );
			state = reducer( state, actions.setCurrentDurationSeconds( 5 ) );

			expect( state ).toEqual( {
				selectedStyle: 'cinematic',
				currentVideoUrl: 'https://example.com/clip.mp4',
				currentAttachmentId: 7,
				currentDurationSeconds: 5,
			} );
		} );

		it( 'allows clearing values back to null', () => {
			let state = reducer( getInitialState(), actions.setSelectedStyle( 'cinematic' ) );
			state = reducer( state, actions.setSelectedStyle( null ) );

			expect( state.selectedStyle ).toBeNull();
		} );
	} );

	describe( 'Selectors', () => {
		it( 'getSelectedStyle returns the selected style', () => {
			const state: VideoStudioState = { ...getInitialState(), selectedStyle: 'cinematic' };
			expect( selectors.getSelectedStyle( state ) ).toBe( 'cinematic' );
		} );

		it( 'getCurrentVideoUrl returns the current video URL', () => {
			const state: VideoStudioState = {
				...getInitialState(),
				currentVideoUrl: 'https://example.com/clip.mp4',
			};
			expect( selectors.getCurrentVideoUrl( state ) ).toBe( 'https://example.com/clip.mp4' );
		} );

		it( 'getCurrentAttachmentId returns the current attachment ID', () => {
			const state: VideoStudioState = { ...getInitialState(), currentAttachmentId: 314 };
			expect( selectors.getCurrentAttachmentId( state ) ).toBe( 314 );
		} );

		it( 'getCurrentDurationSeconds returns the current duration in seconds', () => {
			const state: VideoStudioState = { ...getInitialState(), currentDurationSeconds: 9 };
			expect( selectors.getCurrentDurationSeconds( state ) ).toBe( 9 );
		} );

		it( 'selectors return correct values on the initial state', () => {
			const state = getInitialState();
			expect( selectors.getSelectedStyle( state ) ).toBe( 'cinematic' );
			expect( selectors.getCurrentVideoUrl( state ) ).toBeNull();
			expect( selectors.getCurrentAttachmentId( state ) ).toBeNull();
			expect( selectors.getCurrentDurationSeconds( state ) ).toBeNull();
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
