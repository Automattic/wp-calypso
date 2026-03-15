/* eslint-disable import/order */
/**
 * Tests for Image Studio Store
 */
import type { ImageStudioState, ImageStudioEntryPoint, AnnotationCanvasRef } from './index';
// Mock localStorage
const localStorageMock = ( () => {
	let store: Record< string, string > = {};
	return {
		getItem: jest.fn( ( key: string ) => store[ key ] || null ),
		setItem: jest.fn( ( key: string, value: string ) => {
			store[ key ] = value;
		} ),
		removeItem: jest.fn( ( key: string ) => {
			delete store[ key ];
		} ),
		clear: jest.fn( () => {
			store = {};
		} ),
	};
} )();

Object.defineProperty( window, 'localStorage', {
	value: localStorageMock,
	writable: true,
} );

// Mock console.warn to avoid noise in tests
const consoleWarnSpy = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );

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
import { store as imageStudioStore } from './index';

describe( 'Image Studio Store', () => {
	const { reducer, actions, selectors } = imageStudioStore as any;

	// Helper to get initial state - this will re-invoke the reducer's initialization logic
	const getInitialState = (): ImageStudioState => {
		// Clear and reset localStorage before getting initial state for each test
		localStorageMock.clear();
		return reducer( undefined, { type: '@@INIT' } as any );
	};

	beforeEach( () => {
		localStorageMock.clear();
		jest.clearAllMocks();
	} );

	afterAll( () => {
		consoleWarnSpy.mockRestore();
	} );

	describe( 'Initial State', () => {
		it( 'has correct default values', () => {
			const state = getInitialState();

			expect( state ).toMatchObject( {
				isImageStudioOpen: false,
				imageStudioAttachmentId: null,
				imageStudioOriginalImageUrl: null,
				imageStudioCurrentImageUrl: null,
				imageStudioAiProcessing: false,
				isAnnotationMode: false,
				imageStudioTransitioning: false,
				annotationCanvasRef: null,
				isAnnotationSaving: false,
				annotatedAttachmentIds: [],
				imageStudioAiProcessingSources: {},
				originalAttachmentId: null,
				draftIds: [],
				savedAttachmentIds: [],
				hasUpdatedMetadata: false,
				canvasMetadata: null,
				lastSavedAttachmentId: null,
				isExitConfirmed: false,
				entryPoint: null,
				onCloseCallback: null,
				notices: [],
				navigableAttachmentIds: [],
				currentNavigationIndex: -1,
				navigationCurrentPage: 1,
				navigationHasMorePages: true,
				isSidebarOpen: false,
				selectedStyle: '',
				selectedAspectRatio: null,
				lastAgentMessageId: null,
			} );
		} );

		it( 'initializes with localStorage value at module load time', () => {
			// Note: This test reflects that localStorage is read once at module load time
			// The OPEN_IMAGE_STUDIO action re-reads localStorage each time
			const state = getInitialState();
			// Since we clear localStorage in beforeEach, initial state should be false
			expect( state.isSidebarOpen ).toBe( false );
		} );

		it( 'defaults to closed sidebar when localStorage has invalid value', () => {
			localStorageMock.setItem( 'big-sky-image-studio-sidebar-open', 'invalid' );
			const state = getInitialState();
			expect( state.isSidebarOpen ).toBe( false );
		} );

		it( 'handles localStorage errors gracefully', () => {
			localStorageMock.getItem.mockImplementationOnce( () => {
				throw new Error( 'localStorage error' );
			} );
			const state = getInitialState();
			expect( state.isSidebarOpen ).toBe( false );
		} );
	} );

	describe( 'Actions', () => {
		describe( 'openImageStudio', () => {
			it( 'creates action with all parameters', () => {
				const callback = jest.fn();
				const action = actions.openImageStudio(
					123,
					callback,
					'media_library' as ImageStudioEntryPoint
				);

				expect( action ).toEqual( {
					type: 'OPEN_IMAGE_STUDIO',
					payload: {
						attachmentId: 123,
						entryPoint: 'media_library',
						onCloseCallback: callback,
					},
				} );
			} );

			it( 'handles undefined parameters', () => {
				const action = actions.openImageStudio();

				expect( action ).toEqual( {
					type: 'OPEN_IMAGE_STUDIO',
					payload: {
						attachmentId: null,
						entryPoint: null,
						onCloseCallback: null,
					},
				} );
			} );
		} );

		describe( 'closeImageStudio', () => {
			it( 'creates close action', () => {
				const action = actions.closeImageStudio();

				expect( action ).toEqual( {
					type: 'CLOSE_IMAGE_STUDIO',
				} );
			} );
		} );

		describe( 'updateImageStudioCanvas', () => {
			it( 'creates action with all parameters', () => {
				const action = actions.updateImageStudioCanvas(
					'https://example.com/image.jpg',
					456,
					true
				);

				expect( action ).toEqual( {
					type: 'UPDATE_IMAGE_STUDIO_CANVAS',
					payload: {
						url: 'https://example.com/image.jpg',
						attachmentId: 456,
						isAiProcessing: true,
					},
				} );
			} );

			it( 'defaults isAiProcessing to false', () => {
				const action = actions.updateImageStudioCanvas( 'https://example.com/image.jpg', 456 );

				expect( action.payload.isAiProcessing ).toBe( false );
			} );
		} );

		describe( 'setImageStudioAiProcessing', () => {
			it( 'handles boolean input', () => {
				const action = actions.setImageStudioAiProcessing( true );

				expect( action ).toEqual( {
					type: 'SET_IMAGE_STUDIO_AI_PROCESSING',
					payload: {
						source: 'default',
						value: true,
					},
				} );
			} );

			it( 'handles object input with source', () => {
				const action = actions.setImageStudioAiProcessing( {
					source: 'annotation',
					value: false,
				} );

				expect( action ).toEqual( {
					type: 'SET_IMAGE_STUDIO_AI_PROCESSING',
					payload: {
						source: 'annotation',
						value: false,
					},
				} );
			} );

			it( 'defaults source to "default" when not provided in object', () => {
				const action = actions.setImageStudioAiProcessing( {
					value: true,
				} as any );

				expect( action.payload.source ).toBe( 'default' );
			} );
		} );

		describe( 'addNotice', () => {
			it( 'creates notice with generated ID', () => {
				const action = actions.addNotice( 'Test message', 'error' );

				expect( action.type ).toBe( 'ADD_NOTICE' );
				expect( action.payload.content ).toBe( 'Test message' );
				expect( action.payload.type ).toBe( 'error' );
				expect( typeof action.payload.id ).toBe( 'string' );
				expect( action.payload.id.length ).toBeGreaterThan( 0 );
			} );

			it( 'generates unique IDs for different notices', () => {
				const action1 = actions.addNotice( 'Message 1', 'error' );
				const action2 = actions.addNotice( 'Message 2', 'success' );

				expect( action1.payload.id ).not.toBe( action2.payload.id );
			} );
		} );
	} );

	describe( 'Reducer', () => {
		describe( 'OPEN_IMAGE_STUDIO', () => {
			it( 'resets state and opens studio', () => {
				const previousState: ImageStudioState = {
					...getInitialState(),
					isImageStudioOpen: false,
					notices: [ { id: '1', content: 'old notice', type: 'error' } ],
					draftIds: [ 99 ],
				};

				const state = reducer(
					previousState,
					actions.openImageStudio( 123, null, 'media_library' as ImageStudioEntryPoint )
				);

				expect( state.isImageStudioOpen ).toBe( true );
				expect( state.imageStudioAttachmentId ).toBe( 123 );
				expect( state.originalAttachmentId ).toBe( 123 );
				expect( state.entryPoint ).toBe( 'media_library' );
				expect( state.notices ).toEqual( [] );
				expect( state.draftIds ).toEqual( [] );
				expect( state.savedAttachmentIds ).toEqual( [] );
			} );

			it( 'sets originalAttachmentId to null when opening without attachment', () => {
				const state = reducer( getInitialState(), actions.openImageStudio() );

				expect( state.originalAttachmentId ).toBeNull();
				expect( state.imageStudioAttachmentId ).toBeNull();
			} );

			it( 're-reads sidebar state from localStorage on open', () => {
				// Don't use getInitialState() as it clears localStorage
				const initialState = reducer( undefined, { type: '@@INIT' } as any );

				// Now set localStorage value
				localStorageMock.setItem( 'big-sky-image-studio-sidebar-open', 'true' );

				const state = reducer( initialState, actions.openImageStudio( 123 ) );

				expect( state.isSidebarOpen ).toBe( true );
			} );
		} );

		describe( 'CLOSE_IMAGE_STUDIO', () => {
			it( 'resets to initial state', () => {
				const previousState: ImageStudioState = {
					...getInitialState(),
					isImageStudioOpen: true,
					imageStudioAttachmentId: 123,
					draftIds: [ 1, 2 ],
					notices: [ { id: '1', content: 'notice', type: 'error' } ],
				};

				const state = reducer( previousState, actions.closeImageStudio() );

				expect( state ).toEqual( getInitialState() );
			} );
		} );

		describe( 'UPDATE_IMAGE_STUDIO_CANVAS', () => {
			it( 'updates URL and attachment ID', () => {
				const state = reducer(
					getInitialState(),
					actions.updateImageStudioCanvas( 'https://example.com/new.jpg', 789 )
				);

				expect( state.imageStudioCurrentImageUrl ).toBe( 'https://example.com/new.jpg' );
				expect( state.imageStudioAttachmentId ).toBe( 789 );
			} );

			it( 'manages AI processing sources when isAiProcessing is true', () => {
				const state = reducer(
					getInitialState(),
					actions.updateImageStudioCanvas( 'https://example.com/new.jpg', 789, true )
				);

				expect( state.imageStudioAiProcessing ).toBe( true );
				expect( state.imageStudioAiProcessingSources ).toEqual( { default: true } );
			} );

			it( 'removes source when isAiProcessing is false', () => {
				const previousState: ImageStudioState = {
					...getInitialState(),
					imageStudioAiProcessing: true,
					imageStudioAiProcessingSources: { default: true, annotation: true },
				};

				const state = reducer(
					previousState,
					actions.updateImageStudioCanvas( 'https://example.com/new.jpg', 789, false )
				);

				expect( state.imageStudioAiProcessingSources ).toEqual( { annotation: true } );
				expect( state.imageStudioAiProcessing ).toBe( true ); // Still true because annotation source is active
			} );

			it( 'sets imageStudioAiProcessing to false when all sources are removed', () => {
				const previousState: ImageStudioState = {
					...getInitialState(),
					imageStudioAiProcessing: true,
					imageStudioAiProcessingSources: { default: true },
				};

				const state = reducer(
					previousState,
					actions.updateImageStudioCanvas( 'https://example.com/new.jpg', 789, false )
				);

				expect( state.imageStudioAiProcessing ).toBe( false );
				expect( state.imageStudioAiProcessingSources ).toEqual( {} );
			} );
		} );

		describe( 'SET_IMAGE_STUDIO_AI_PROCESSING', () => {
			it( 'adds processing source when value is true', () => {
				const state = reducer(
					getInitialState(),
					actions.setImageStudioAiProcessing( { source: 'annotation', value: true } )
				);

				expect( state.imageStudioAiProcessing ).toBe( true );
				expect( state.imageStudioAiProcessingSources ).toEqual( { annotation: true } );
			} );

			it( 'removes processing source when value is false', () => {
				const previousState: ImageStudioState = {
					...getInitialState(),
					imageStudioAiProcessing: true,
					imageStudioAiProcessingSources: { annotation: true, default: true },
				};

				const state = reducer(
					previousState,
					actions.setImageStudioAiProcessing( { source: 'annotation', value: false } )
				);

				expect( state.imageStudioAiProcessingSources ).toEqual( { default: true } );
				expect( state.imageStudioAiProcessing ).toBe( true );
			} );

			it( 'manages multiple sources independently', () => {
				let state = getInitialState();

				state = reducer(
					state,
					actions.setImageStudioAiProcessing( { source: 'source1', value: true } )
				);
				expect( state.imageStudioAiProcessing ).toBe( true );

				state = reducer(
					state,
					actions.setImageStudioAiProcessing( { source: 'source2', value: true } )
				);
				expect( state.imageStudioAiProcessingSources ).toEqual( { source1: true, source2: true } );

				state = reducer(
					state,
					actions.setImageStudioAiProcessing( { source: 'source1', value: false } )
				);
				expect( state.imageStudioAiProcessing ).toBe( true );
				expect( state.imageStudioAiProcessingSources ).toEqual( { source2: true } );

				state = reducer(
					state,
					actions.setImageStudioAiProcessing( { source: 'source2', value: false } )
				);
				expect( state.imageStudioAiProcessing ).toBe( false );
				expect( state.imageStudioAiProcessingSources ).toEqual( {} );
			} );
		} );

		describe( 'ADD_SAVED_ATTACHMENT_ID', () => {
			it( 'adds attachment ID to saved list', () => {
				const state = reducer( getInitialState(), actions.addSavedAttachmentId( 123 ) );

				expect( state.savedAttachmentIds ).toEqual( [ 123 ] );
			} );

			it( 'prevents duplicate saved IDs', () => {
				let state = reducer( getInitialState(), actions.addSavedAttachmentId( 123 ) );
				state = reducer( state, actions.addSavedAttachmentId( 123 ) );

				expect( state.savedAttachmentIds ).toEqual( [ 123 ] );
			} );

			it( 'removes ID from draftIds when saving', () => {
				const previousState: ImageStudioState = {
					...getInitialState(),
					draftIds: [ 123, 456, 789 ],
				};

				const state = reducer( previousState, actions.addSavedAttachmentId( 456 ) );

				expect( state.savedAttachmentIds ).toEqual( [ 456 ] );
				expect( state.draftIds ).toEqual( [ 123, 789 ] );
			} );

			it( 'preserves other saved IDs', () => {
				const previousState: ImageStudioState = {
					...getInitialState(),
					savedAttachmentIds: [ 100, 200 ],
					draftIds: [ 300 ],
				};

				const state = reducer( previousState, actions.addSavedAttachmentId( 300 ) );

				expect( state.savedAttachmentIds ).toEqual( [ 100, 200, 300 ] );
			} );
		} );

		describe( 'ADD_ANNOTATED_ATTACHMENT_ID', () => {
			it( 'adds attachment ID to annotated list', () => {
				const state = reducer( getInitialState(), actions.addAnnotatedAttachmentId( 456 ) );

				expect( state.annotatedAttachmentIds ).toEqual( [ 456 ] );
			} );

			it( 'allows duplicate annotated IDs', () => {
				let state = reducer( getInitialState(), actions.addAnnotatedAttachmentId( 456 ) );
				state = reducer( state, actions.addAnnotatedAttachmentId( 456 ) );

				expect( state.annotatedAttachmentIds ).toEqual( [ 456, 456 ] );
			} );
		} );

		describe( 'ADD_NOTICE and REMOVE_NOTICE', () => {
			it( 'adds notice to list', () => {
				const state = reducer( getInitialState(), actions.addNotice( 'Error message', 'error' ) );

				expect( state.notices ).toHaveLength( 1 );
				expect( state.notices[ 0 ] ).toMatchObject( {
					content: 'Error message',
					type: 'error',
				} );
			} );

			it( 'removes notice by ID', () => {
				let state = reducer( getInitialState(), actions.addNotice( 'Message 1', 'error' ) );
				const noticeId = state.notices[ 0 ].id;
				state = reducer( state, actions.addNotice( 'Message 2', 'success' ) );

				expect( state.notices ).toHaveLength( 2 );

				state = reducer( state, actions.removeNotice( noticeId ) );

				expect( state.notices ).toHaveLength( 1 );
				expect( state.notices[ 0 ].content ).toBe( 'Message 2' );
			} );

			it( 'handles removing non-existent notice', () => {
				const previousState: ImageStudioState = {
					...getInitialState(),
					notices: [ { id: 'existing', content: 'Existing', type: 'error' } ],
				};

				const state = reducer( previousState, actions.removeNotice( 'non-existent' ) );

				expect( state.notices ).toEqual( previousState.notices );
			} );
		} );

		describe( 'SET_NAVIGABLE_ATTACHMENT_IDS', () => {
			it( 'sets navigable list and calculates current index', () => {
				const state = reducer(
					getInitialState(),
					actions.setNavigableAttachmentIds( [ 10, 20, 30, 40 ], 30 )
				);

				expect( state.navigableAttachmentIds ).toEqual( [ 10, 20, 30, 40 ] );
				expect( state.currentNavigationIndex ).toBe( 2 );
			} );

			it( 'sets index to -1 when current ID is not in list', () => {
				const state = reducer(
					getInitialState(),
					actions.setNavigableAttachmentIds( [ 10, 20, 30 ], 99 )
				);

				expect( state.currentNavigationIndex ).toBe( -1 );
			} );

			it( 'sets index to -1 when currentAttachmentId is null', () => {
				const state = reducer(
					getInitialState(),
					actions.setNavigableAttachmentIds( [ 10, 20, 30 ], null )
				);

				expect( state.currentNavigationIndex ).toBe( -1 );
			} );
		} );

		describe( 'NAVIGATE_TO_ATTACHMENT', () => {
			it( 'navigates to attachment in the list', () => {
				const previousState: ImageStudioState = {
					...getInitialState(),
					navigableAttachmentIds: [ 10, 20, 30 ],
					currentNavigationIndex: 0,
					imageStudioAttachmentId: 10,
					originalAttachmentId: 10,
				};

				const state = reducer( previousState, actions.navigateToAttachment( 30 ) );

				expect( state.currentNavigationIndex ).toBe( 2 );
				expect( state.imageStudioAttachmentId ).toBe( 30 );
				expect( state.originalAttachmentId ).toBe( 30 );
			} );

			it( 'resets working session state when navigating', () => {
				const previousState: ImageStudioState = {
					...getInitialState(),
					navigableAttachmentIds: [ 10, 20, 30 ],
					currentNavigationIndex: 0,
					imageStudioAttachmentId: 10,
					draftIds: [ 99 ],
					savedAttachmentIds: [ 88 ],
					hasUpdatedMetadata: true,
					annotatedAttachmentIds: [ 77 ],
					isAnnotationMode: true,
					notices: [ { id: '1', content: 'Notice', type: 'error' } ],
				};

				const state = reducer( previousState, actions.navigateToAttachment( 20 ) );

				expect( state.draftIds ).toEqual( [] );
				expect( state.savedAttachmentIds ).toEqual( [] );
				expect( state.hasUpdatedMetadata ).toBe( false );
				expect( state.annotatedAttachmentIds ).toEqual( [] );
				expect( state.isAnnotationMode ).toBe( false );
				expect( state.notices ).toEqual( [] );
			} );

			it( 'preserves navigation and user preferences when navigating', () => {
				const previousState: ImageStudioState = {
					...getInitialState(),
					navigableAttachmentIds: [ 10, 20, 30 ],
					currentNavigationIndex: 0,
					navigationCurrentPage: 3,
					navigationHasMorePages: true,
					isSidebarOpen: true,
					selectedStyle: 'watercolor',
					selectedAspectRatio: '16:9',
				};

				const state = reducer( previousState, actions.navigateToAttachment( 20 ) );

				expect( state.navigationCurrentPage ).toBe( 3 );
				expect( state.navigationHasMorePages ).toBe( true );
				expect( state.isSidebarOpen ).toBe( true );
				expect( state.selectedStyle ).toBe( 'watercolor' );
				expect( state.selectedAspectRatio ).toBe( '16:9' );
			} );

			it( 'warns and returns unchanged state for attachment not in list', () => {
				const previousState: ImageStudioState = {
					...getInitialState(),
					navigableAttachmentIds: [ 10, 20, 30 ],
					currentNavigationIndex: 1,
				};

				const state = reducer( previousState, actions.navigateToAttachment( 999 ) );

				expect( state ).toBe( previousState );
				expect( consoleWarnSpy ).toHaveBeenCalledWith(
					expect.stringContaining( 'Attempted to navigate to attachment 999' )
				);
			} );
		} );

		describe( 'SET_NAVIGATION_PAGINATION', () => {
			it( 'updates pagination state', () => {
				const state = reducer( getInitialState(), actions.setNavigationPagination( 5, false ) );

				expect( state.navigationCurrentPage ).toBe( 5 );
				expect( state.navigationHasMorePages ).toBe( false );
			} );
		} );

		describe( 'SET_IS_SIDEBAR_OPEN', () => {
			it( 'updates sidebar state', () => {
				const state = reducer( getInitialState(), actions.setIsSidebarOpen( true ) );

				expect( state.isSidebarOpen ).toBe( true );
			} );

			it( 'persists to localStorage', () => {
				reducer( getInitialState(), actions.setIsSidebarOpen( true ) );

				expect( localStorageMock.setItem ).toHaveBeenCalledWith(
					'big-sky-image-studio-sidebar-open',
					'true'
				);
			} );

			it( 'handles localStorage errors gracefully', () => {
				localStorageMock.setItem.mockImplementationOnce( () => {
					throw new Error( 'localStorage error' );
				} );

				const state = reducer( getInitialState(), actions.setIsSidebarOpen( true ) );

				expect( state.isSidebarOpen ).toBe( true );
			} );
		} );

		describe( 'RESET_CANVAS_HISTORY', () => {
			it( 'resets canvas editing history', () => {
				const previousState: ImageStudioState = {
					...getInitialState(),
					hasUpdatedMetadata: true,
					isAnnotationMode: true,
					lastSavedAttachmentId: 123,
					canvasMetadata: { title: 'Test' },
					draftIds: [ 1, 2 ],
					savedAttachmentIds: [ 3, 4 ],
					annotatedAttachmentIds: [ 5, 6 ],
					originalAttachmentId: 999,
					entryPoint: 'media_library' as ImageStudioEntryPoint,
				};

				const state = reducer( previousState, actions.resetCanvasHistory() );

				expect( state.hasUpdatedMetadata ).toBe( false );
				expect( state.isAnnotationMode ).toBe( false );
				expect( state.lastSavedAttachmentId ).toBeNull();
				expect( state.canvasMetadata ).toBeNull();
				expect( state.draftIds ).toEqual( [] );
				expect( state.savedAttachmentIds ).toEqual( [] );
				expect( state.annotatedAttachmentIds ).toEqual( [] );
				// Should preserve session context
				expect( state.originalAttachmentId ).toBe( 999 );
				expect( state.entryPoint ).toBe( 'media_library' );
			} );
		} );

		describe( 'Simple state setters', () => {
			it( 'SET_IMAGE_STUDIO_ORIGINAL_IMAGE_URL', () => {
				const state = reducer(
					getInitialState(),
					actions.setImageStudioOriginalImageUrl( 'https://example.com/original.jpg' )
				);

				expect( state.imageStudioOriginalImageUrl ).toBe( 'https://example.com/original.jpg' );
			} );

			it( 'SET_ANNOTATION_MODE', () => {
				const state = reducer( getInitialState(), actions.setAnnotationMode( true ) );

				expect( state.isAnnotationMode ).toBe( true );
			} );

			it( 'SET_ANNOTATION_CANVAS_REF', () => {
				const mockRef: AnnotationCanvasRef = {
					clear: jest.fn(),
					undo: jest.fn(),
					redo: jest.fn(),
					getBlob: jest.fn(),
					hasAnnotations: jest.fn(),
					hasUndoneAnnotations: jest.fn(),
				};

				const state = reducer( getInitialState(), actions.setAnnotationCanvasRef( mockRef ) );

				expect( state.annotationCanvasRef ).toBe( mockRef );
			} );

			it( 'SET_DRAFT_IDS', () => {
				const state = reducer( getInitialState(), actions.setDraftIds( [ 1, 2, 3 ] ) );

				expect( state.draftIds ).toEqual( [ 1, 2, 3 ] );
			} );

			it( 'SET_HAS_UPDATED_METADATA', () => {
				const state = reducer( getInitialState(), actions.setHasUpdatedMetadata( true ) );

				expect( state.hasUpdatedMetadata ).toBe( true );
			} );

			it( 'SET_CANVAS_METADATA', () => {
				const metadata = { title: 'Test Title', alt_text: 'Test Alt' };
				const state = reducer( getInitialState(), actions.setCanvasMetadata( metadata ) );

				expect( state.canvasMetadata ).toEqual( metadata );
			} );

			it( 'SET_IS_ANNOTATION_SAVING', () => {
				const state = reducer( getInitialState(), actions.setIsAnnotationSaving( true ) );

				expect( state.isAnnotationSaving ).toBe( true );
			} );

			it( 'SET_LAST_SAVED_ATTACHMENT_ID', () => {
				const state = reducer( getInitialState(), actions.setLastSavedAttachmentId( 789 ) );

				expect( state.lastSavedAttachmentId ).toBe( 789 );
			} );

			it( 'SET_IS_EXIT_CONFIRMED', () => {
				const state = reducer( getInitialState(), actions.setIsExitConfirmed( true ) );

				expect( state.isExitConfirmed ).toBe( true );
			} );

			it( 'SET_SELECTED_STYLE', () => {
				const state = reducer( getInitialState(), actions.setSelectedStyle( 'watercolor' ) );

				expect( state.selectedStyle ).toBe( 'watercolor' );
			} );

			it( 'SET_SELECTED_ASPECT_RATIO', () => {
				const state = reducer( getInitialState(), actions.setSelectedAspectRatio( '16:9' ) );

				expect( state.selectedAspectRatio ).toBe( '16:9' );
			} );

			it( 'SET_LAST_AGENT_MESSAGE_ID', () => {
				const state = reducer( getInitialState(), actions.setLastAgentMessageId( 'msg-123' ) );

				expect( state.lastAgentMessageId ).toBe( 'msg-123' );
			} );
		} );
	} );

	describe( 'Selectors', () => {
		it( 'getIsImageStudioOpen', () => {
			const state: ImageStudioState = { ...getInitialState(), isImageStudioOpen: true };
			expect( selectors.getIsImageStudioOpen( state ) ).toBe( true );
		} );

		it( 'getImageStudioAttachmentId', () => {
			const state: ImageStudioState = { ...getInitialState(), imageStudioAttachmentId: 123 };
			expect( selectors.getImageStudioAttachmentId( state ) ).toBe( 123 );
		} );

		it( 'getImageStudioOriginalImageUrl', () => {
			const state: ImageStudioState = {
				...getInitialState(),
				imageStudioOriginalImageUrl: 'https://example.com/original.jpg',
			};
			expect( selectors.getImageStudioOriginalImageUrl( state ) ).toBe(
				'https://example.com/original.jpg'
			);
		} );

		it( 'getImageStudioCurrentImageUrl', () => {
			const state: ImageStudioState = {
				...getInitialState(),
				imageStudioCurrentImageUrl: 'https://example.com/current.jpg',
			};
			expect( selectors.getImageStudioCurrentImageUrl( state ) ).toBe(
				'https://example.com/current.jpg'
			);
		} );

		it( 'getImageStudioAiProcessing', () => {
			const state: ImageStudioState = { ...getInitialState(), imageStudioAiProcessing: true };
			expect( selectors.getImageStudioAiProcessing( state ) ).toBe( true );
		} );

		it( 'getIsAnnotationMode', () => {
			const state: ImageStudioState = { ...getInitialState(), isAnnotationMode: true };
			expect( selectors.getIsAnnotationMode( state ) ).toBe( true );
		} );

		it( 'getImageStudioTransitioning', () => {
			const state: ImageStudioState = { ...getInitialState(), imageStudioTransitioning: true };
			expect( selectors.getImageStudioTransitioning( state ) ).toBe( true );
		} );

		it( 'getAnnotationCanvasRef', () => {
			const mockRef: AnnotationCanvasRef = {
				clear: jest.fn(),
				undo: jest.fn(),
				redo: jest.fn(),
				getBlob: jest.fn(),
				hasAnnotations: jest.fn(),
				hasUndoneAnnotations: jest.fn(),
			};
			const state: ImageStudioState = { ...getInitialState(), annotationCanvasRef: mockRef };
			expect( selectors.getAnnotationCanvasRef( state ) ).toBe( mockRef );
		} );

		it( 'getOriginalAttachmentId', () => {
			const state: ImageStudioState = { ...getInitialState(), originalAttachmentId: 456 };
			expect( selectors.getOriginalAttachmentId( state ) ).toBe( 456 );
		} );

		it( 'getDraftIds', () => {
			const state: ImageStudioState = { ...getInitialState(), draftIds: [ 1, 2, 3 ] };
			expect( selectors.getDraftIds( state ) ).toEqual( [ 1, 2, 3 ] );
		} );

		it( 'getHasUpdatedMetadata', () => {
			const state: ImageStudioState = { ...getInitialState(), hasUpdatedMetadata: true };
			expect( selectors.getHasUpdatedMetadata( state ) ).toBe( true );
		} );

		it( 'getCanvasMetadata', () => {
			const metadata = { title: 'Test' };
			const state: ImageStudioState = { ...getInitialState(), canvasMetadata: metadata };
			expect( selectors.getCanvasMetadata( state ) ).toEqual( metadata );
		} );

		it( 'getIsAnnotationSaving', () => {
			const state: ImageStudioState = { ...getInitialState(), isAnnotationSaving: true };
			expect( selectors.getIsAnnotationSaving( state ) ).toBe( true );
		} );

		it( 'getAnnotatedAttachmentIds', () => {
			const state: ImageStudioState = { ...getInitialState(), annotatedAttachmentIds: [ 7, 8, 9 ] };
			expect( selectors.getAnnotatedAttachmentIds( state ) ).toEqual( [ 7, 8, 9 ] );
		} );

		it( 'getLastSavedAttachmentId', () => {
			const state: ImageStudioState = { ...getInitialState(), lastSavedAttachmentId: 789 };
			expect( selectors.getLastSavedAttachmentId( state ) ).toBe( 789 );
		} );

		it( 'getSavedAttachmentIds', () => {
			const state: ImageStudioState = { ...getInitialState(), savedAttachmentIds: [ 10, 11, 12 ] };
			expect( selectors.getSavedAttachmentIds( state ) ).toEqual( [ 10, 11, 12 ] );
		} );

		it( 'getIsExitConfirmed', () => {
			const state: ImageStudioState = { ...getInitialState(), isExitConfirmed: true };
			expect( selectors.getIsExitConfirmed( state ) ).toBe( true );
		} );

		it( 'getEntryPoint', () => {
			const state: ImageStudioState = {
				...getInitialState(),
				entryPoint: 'media_library' as ImageStudioEntryPoint,
			};
			expect( selectors.getEntryPoint( state ) ).toBe( 'media_library' );
		} );

		it( 'getNotices', () => {
			const notices = [ { id: '1', content: 'Test', type: 'error' as const } ];
			const state: ImageStudioState = { ...getInitialState(), notices };
			expect( selectors.getNotices( state ) ).toEqual( notices );
		} );

		it( 'getOnCloseCallback', () => {
			const callback = jest.fn();
			const state: ImageStudioState = { ...getInitialState(), onCloseCallback: callback };
			expect( selectors.getOnCloseCallback( state ) ).toBe( callback );
		} );

		it( 'getNavigableAttachmentIds', () => {
			const state: ImageStudioState = { ...getInitialState(), navigableAttachmentIds: [ 1, 2, 3 ] };
			expect( selectors.getNavigableAttachmentIds( state ) ).toEqual( [ 1, 2, 3 ] );
		} );

		it( 'getCurrentNavigationIndex', () => {
			const state: ImageStudioState = { ...getInitialState(), currentNavigationIndex: 2 };
			expect( selectors.getCurrentNavigationIndex( state ) ).toBe( 2 );
		} );

		it( 'getIsSidebarOpen', () => {
			const state: ImageStudioState = { ...getInitialState(), isSidebarOpen: true };
			expect( selectors.getIsSidebarOpen( state ) ).toBe( true );
		} );

		it( 'getNavigationCurrentPage', () => {
			const state: ImageStudioState = { ...getInitialState(), navigationCurrentPage: 5 };
			expect( selectors.getNavigationCurrentPage( state ) ).toBe( 5 );
		} );

		it( 'getNavigationHasMorePages', () => {
			const state: ImageStudioState = { ...getInitialState(), navigationHasMorePages: false };
			expect( selectors.getNavigationHasMorePages( state ) ).toBe( false );
		} );

		it( 'getSelectedStyle', () => {
			const state: ImageStudioState = { ...getInitialState(), selectedStyle: 'watercolor' };
			expect( selectors.getSelectedStyle( state ) ).toBe( 'watercolor' );
		} );

		it( 'getSelectedAspectRatio', () => {
			const state: ImageStudioState = { ...getInitialState(), selectedAspectRatio: '16:9' };
			expect( selectors.getSelectedAspectRatio( state ) ).toBe( '16:9' );
		} );

		it( 'getLastAgentMessageId', () => {
			const state: ImageStudioState = { ...getInitialState(), lastAgentMessageId: 'msg-123' };
			expect( selectors.getLastAgentMessageId( state ) ).toBe( 'msg-123' );
		} );

		describe( 'getHasUnsavedChanges', () => {
			it( 'returns true when metadata has been updated', () => {
				const state: ImageStudioState = {
					...getInitialState(),
					hasUpdatedMetadata: true,
					imageStudioAttachmentId: 123,
					originalAttachmentId: 123,
				};

				expect( selectors.getHasUnsavedChanges( state ) ).toBe( true );
			} );

			it( 'returns false when no image is loaded', () => {
				const state: ImageStudioState = {
					...getInitialState(),
					imageStudioAttachmentId: null,
				};

				expect( selectors.getHasUnsavedChanges( state ) ).toBe( false );
			} );

			it( 'returns false when current image is the original', () => {
				const state: ImageStudioState = {
					...getInitialState(),
					imageStudioAttachmentId: 100,
					originalAttachmentId: 100,
					hasUpdatedMetadata: false,
				};

				expect( selectors.getHasUnsavedChanges( state ) ).toBe( false );
			} );

			it( 'returns false when current image has been saved', () => {
				const state: ImageStudioState = {
					...getInitialState(),
					imageStudioAttachmentId: 200,
					originalAttachmentId: 100,
					savedAttachmentIds: [ 150, 200, 250 ],
					hasUpdatedMetadata: false,
				};

				expect( selectors.getHasUnsavedChanges( state ) ).toBe( false );
			} );

			it( 'returns true for unsaved draft', () => {
				const state: ImageStudioState = {
					...getInitialState(),
					imageStudioAttachmentId: 300,
					originalAttachmentId: 100,
					savedAttachmentIds: [ 200 ],
					draftIds: [ 300 ],
					hasUpdatedMetadata: false,
				};

				expect( selectors.getHasUnsavedChanges( state ) ).toBe( true );
			} );

			it( 'returns true for newly generated image not yet saved', () => {
				const state: ImageStudioState = {
					...getInitialState(),
					imageStudioAttachmentId: 400,
					originalAttachmentId: 100,
					savedAttachmentIds: [],
					hasUpdatedMetadata: false,
				};

				expect( selectors.getHasUnsavedChanges( state ) ).toBe( true );
			} );
		} );

		describe( 'Navigation selectors', () => {
			const navigationState: ImageStudioState = {
				...getInitialState(),
				navigableAttachmentIds: [ 10, 20, 30, 40, 50 ],
				currentNavigationIndex: 2,
			};

			describe( 'getHasNextImage', () => {
				it( 'returns true when not at end of list', () => {
					expect( selectors.getHasNextImage( navigationState ) ).toBe( true );
				} );

				it( 'returns false when at end of list', () => {
					const state = { ...navigationState, currentNavigationIndex: 4 };
					expect( selectors.getHasNextImage( state ) ).toBe( false );
				} );

				it( 'returns false when index is -1', () => {
					const state = { ...navigationState, currentNavigationIndex: -1 };
					expect( selectors.getHasNextImage( state ) ).toBe( false );
				} );
			} );

			describe( 'getHasPreviousImage', () => {
				it( 'returns true when not at start of list', () => {
					expect( selectors.getHasPreviousImage( navigationState ) ).toBe( true );
				} );

				it( 'returns false when at start of list', () => {
					const state = { ...navigationState, currentNavigationIndex: 0 };
					expect( selectors.getHasPreviousImage( state ) ).toBe( false );
				} );

				it( 'returns false when index is -1', () => {
					const state = { ...navigationState, currentNavigationIndex: -1 };
					expect( selectors.getHasPreviousImage( state ) ).toBe( false );
				} );
			} );

			describe( 'getNextAttachmentId', () => {
				it( 'returns next attachment ID when available', () => {
					expect( selectors.getNextAttachmentId( navigationState ) ).toBe( 40 );
				} );

				it( 'returns null when at end of list', () => {
					const state = { ...navigationState, currentNavigationIndex: 4 };
					expect( selectors.getNextAttachmentId( state ) ).toBeNull();
				} );

				it( 'returns null when index is -1', () => {
					const state = { ...navigationState, currentNavigationIndex: -1 };
					expect( selectors.getNextAttachmentId( state ) ).toBeNull();
				} );
			} );

			describe( 'getPreviousAttachmentId', () => {
				it( 'returns previous attachment ID when available', () => {
					expect( selectors.getPreviousAttachmentId( navigationState ) ).toBe( 20 );
				} );

				it( 'returns null when at start of list', () => {
					const state = { ...navigationState, currentNavigationIndex: 0 };
					expect( selectors.getPreviousAttachmentId( state ) ).toBeNull();
				} );

				it( 'returns null when index is -1', () => {
					const state = { ...navigationState, currentNavigationIndex: -1 };
					expect( selectors.getPreviousAttachmentId( state ) ).toBeNull();
				} );
			} );
		} );
	} );

	describe( 'Store configuration', () => {
		it( 'exports store with correct structure', () => {
			expect( imageStudioStore ).toBeDefined();
			expect( imageStudioStore.name ).toBe( 'image-studio' );
			expect( typeof imageStudioStore.reducer ).toBe( 'function' );
			expect( typeof imageStudioStore.actions ).toBe( 'object' );
			expect( typeof imageStudioStore.selectors ).toBe( 'object' );
		} );
	} );

	describe( 'Complex scenarios', () => {
		describe( 'AI Processing with multiple sources', () => {
			it( 'tracks multiple concurrent AI operations', () => {
				let state = getInitialState();

				// Start annotation processing
				state = reducer(
					state,
					actions.setImageStudioAiProcessing( { source: 'annotation', value: true } )
				);
				expect( state.imageStudioAiProcessing ).toBe( true );

				// Start generation processing
				state = reducer(
					state,
					actions.setImageStudioAiProcessing( { source: 'generation', value: true } )
				);
				expect( state.imageStudioAiProcessing ).toBe( true );
				expect( state.imageStudioAiProcessingSources ).toEqual( {
					annotation: true,
					generation: true,
				} );

				// Complete annotation
				state = reducer(
					state,
					actions.setImageStudioAiProcessing( { source: 'annotation', value: false } )
				);
				expect( state.imageStudioAiProcessing ).toBe( true ); // Still processing generation
				expect( state.imageStudioAiProcessingSources ).toEqual( { generation: true } );

				// Complete generation
				state = reducer(
					state,
					actions.setImageStudioAiProcessing( { source: 'generation', value: false } )
				);
				expect( state.imageStudioAiProcessing ).toBe( false );
				expect( state.imageStudioAiProcessingSources ).toEqual( {} );
			} );
		} );

		describe( 'Session lifecycle', () => {
			it( 'manages complete workflow from open to close', () => {
				let state = getInitialState();

				// Open studio with attachment
				state = reducer( state, actions.openImageStudio( 100 ) );
				expect( state.isImageStudioOpen ).toBe( true );
				expect( state.originalAttachmentId ).toBe( 100 );

				// Generate new image
				state = reducer( state, actions.updateImageStudioCanvas( 'https://new.jpg', 101, true ) );
				expect( state.imageStudioAttachmentId ).toBe( 101 );

				// Add to drafts
				state = reducer( state, actions.setDraftIds( [ 101 ] ) );

				// Save the draft
				state = reducer( state, actions.addSavedAttachmentId( 101 ) );
				expect( state.savedAttachmentIds ).toEqual( [ 101 ] );
				expect( state.draftIds ).toEqual( [] ); // Removed from drafts

				// Close studio
				state = reducer( state, actions.closeImageStudio() );
				expect( state.isImageStudioOpen ).toBe( false );
				expect( state.savedAttachmentIds ).toEqual( [] );
			} );
		} );

		describe( 'Navigation workflow', () => {
			it( 'manages navigation through media library', () => {
				let state = getInitialState();

				// Setup navigable list
				state = reducer( state, actions.setNavigableAttachmentIds( [ 10, 20, 30, 40 ], 20 ) );
				expect( state.currentNavigationIndex ).toBe( 1 );

				// Navigate forward
				expect( selectors.getHasNextImage( state ) ).toBe( true );
				const nextId = selectors.getNextAttachmentId( state );
				expect( nextId ).toBe( 30 );

				state = reducer( state, actions.navigateToAttachment( nextId! ) );
				expect( state.currentNavigationIndex ).toBe( 2 );
				expect( state.imageStudioAttachmentId ).toBe( 30 );

				// Navigate backward
				expect( selectors.getHasPreviousImage( state ) ).toBe( true );
				const prevId = selectors.getPreviousAttachmentId( state );
				expect( prevId ).toBe( 20 );

				state = reducer( state, actions.navigateToAttachment( prevId! ) );
				expect( state.currentNavigationIndex ).toBe( 1 );
			} );
		} );
	} );
} );
