/**
 * @jest-environment jsdom
 */
import { OnboardingNextStepAfterPublishingPost } from '../onboarding-next-step-after-publishing-post';

const mockClosePublishSidebar = jest.fn();
const mockRemoveNotice = jest.fn();
const mockSubscribeCallbacks = [];
const mockUseEffectFunctions = {};
let mockFunctionDescriptor = '';
let mockIsSaving = false;
let mockPostType = 'post';
let mockIsCurrentPostPublished = false;
let mockNotices = [];
let mockSiteIntent = 'newsletter';

// Shared ref objects so tests can control state.
const mockFirstPostRef = { current: null };
const mockFetchPromiseRef = { current: null };
const mockUnmountedRef = { current: false };

let mockApiFetchResult = Promise.resolve( {
	checklist_statuses: { first_post_published: false },
} );

jest.mock( '@wordpress/api-fetch', () => ( {
	__esModule: true,
	default: jest.fn( () => mockApiFetchResult ),
} ) );

const refOrder = [];
jest.mock( 'react', () => ( {
	...jest.requireActual( 'react' ),
	useState: ( initial ) => [ initial, jest.fn() ],
	useEffect: ( fn ) => {
		if ( ! mockUseEffectFunctions[ mockFunctionDescriptor ] ) {
			mockUseEffectFunctions[ mockFunctionDescriptor ] = [];
		}
		mockUseEffectFunctions[ mockFunctionDescriptor ].push( fn );
	},
	useRef: () => {
		// Return refs in creation order: firstPostAlreadyPublished, launchpadFetchPromise, unmounted.
		const ref = refOrder.shift();
		return ref;
	},
} ) );

jest.mock( 'canvas-confetti', () => jest.fn() );

jest.mock( '../celebrate-first-post-modal', () => ( {
	CelebrateFirstPostModal: () => null,
} ) );

jest.mock( '../tracking/track-record-event', () => jest.fn() );

jest.mock( '../use-site-intent', () => ( {
	__esModule: true,
	default: () => ( { siteIntent: mockSiteIntent, siteIntentFetched: true } ),
} ) );

const stubSelect = ( store ) => {
	if ( store === 'core/editor' ) {
		return {
			isSavingPost: () => mockIsSaving,
			getCurrentPostType: () => mockPostType,
			isCurrentPostPublished: () => mockIsCurrentPostPublished,
			getPermalink: () => 'https://example.wordpress.com/?p=1',
		};
	}

	if ( store === 'core/notices' ) {
		return {
			getNotices: () => mockNotices,
		};
	}
};

jest.mock( '@wordpress/data', () => ( {
	subscribe: ( callback ) => {
		mockSubscribeCallbacks.push( callback );
		const unsubscribe = jest.fn( () => {
			const idx = mockSubscribeCallbacks.indexOf( callback );
			if ( idx !== -1 ) {
				mockSubscribeCallbacks.splice( idx, 1 );
			}
		} );
		return unsubscribe;
	},
	select: stubSelect,
	dispatch: ( store ) => {
		if ( store === 'core/edit-post' ) {
			return { closePublishSidebar: mockClosePublishSidebar };
		}
		if ( store === 'core/notices' ) {
			return { removeNotice: mockRemoveNotice };
		}
		return {};
	},
	useSelect: ( selector ) => selector( stubSelect ),
} ) );

function setupRefs() {
	refOrder.length = 0;
	refOrder.push( mockFirstPostRef, mockFetchPromiseRef, mockUnmountedRef );
}

function simulateSaveCycle( { publishAfterSave = false } = {} ) {
	mockIsSaving = true;
	mockSubscribeCallbacks.forEach( ( cb ) => cb() );

	mockIsSaving = false;
	if ( publishAfterSave ) {
		mockIsCurrentPostPublished = true;
	}
	mockSubscribeCallbacks.forEach( ( cb ) => cb() );
}

describe( 'OnboardingNextStepAfterPublishingPost', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockSubscribeCallbacks.length = 0;
		mockIsSaving = false;
		mockPostType = 'post';
		mockIsCurrentPostPublished = false;
		mockNotices = [];
		mockSiteIntent = 'newsletter';
		mockFirstPostRef.current = null;
		mockFetchPromiseRef.current = null;
		mockUnmountedRef.current = false;
		mockApiFetchResult = Promise.resolve( {
			checklist_statuses: { first_post_published: false },
		} );
		Object.keys( mockUseEffectFunctions ).forEach( ( k ) => delete mockUseEffectFunctions[ k ] );
	} );

	it( 'should return null for non-newsletter sites', () => {
		mockFunctionDescriptor = 'non_newsletter';
		mockSiteIntent = 'build';
		setupRefs();

		const result = OnboardingNextStepAfterPublishingPost();

		expect( result ).toBeNull();
	} );

	it( 'should return null when post type is not post', () => {
		mockFunctionDescriptor = 'wrong_post_type';
		mockPostType = 'page';
		setupRefs();

		const result = OnboardingNextStepAfterPublishingPost();

		expect( result ).toBeNull();
	} );

	it( 'should fetch launchpad status on mount for newsletter posts', () => {
		mockFunctionDescriptor = 'fetch_launchpad';
		setupRefs();

		OnboardingNextStepAfterPublishingPost();

		const effects = mockUseEffectFunctions[ mockFunctionDescriptor ];
		expect( effects.length ).toBeGreaterThanOrEqual( 2 );
		effects[ 0 ]();

		const apiFetch = require( '@wordpress/api-fetch' ).default;
		expect( apiFetch ).toHaveBeenCalledWith( { path: '/wpcom/v2/launchpad' } );
	} );

	it( 'should not fetch launchpad for non-newsletter sites', () => {
		mockFunctionDescriptor = 'no_fetch';
		mockSiteIntent = 'build';
		setupRefs();

		OnboardingNextStepAfterPublishingPost();

		const effects = mockUseEffectFunctions[ mockFunctionDescriptor ];
		effects?.forEach( ( fn ) => fn() );

		const apiFetch = require( '@wordpress/api-fetch' ).default;
		expect( apiFetch ).not.toHaveBeenCalled();
	} );

	it( 'should show celebration when first newsletter post is published', async () => {
		mockFunctionDescriptor = 'first_publish';
		mockFirstPostRef.current = false;
		mockFetchPromiseRef.current = Promise.resolve();
		mockNotices = [ { id: 'editor-save' } ];
		setupRefs();

		OnboardingNextStepAfterPublishingPost();

		const effects = mockUseEffectFunctions[ mockFunctionDescriptor ];
		effects[ 1 ]();

		simulateSaveCycle( { publishAfterSave: true } );

		await Promise.resolve();

		expect( mockClosePublishSidebar ).toHaveBeenCalledTimes( 1 );
		expect( mockRemoveNotice ).toHaveBeenCalledWith( 'editor-save' );
	} );

	it( 'should not show celebration when first_post_published is already true', async () => {
		mockFunctionDescriptor = 'already_published';
		mockFirstPostRef.current = true;
		mockFetchPromiseRef.current = Promise.resolve();
		setupRefs();

		OnboardingNextStepAfterPublishingPost();

		const effects = mockUseEffectFunctions[ mockFunctionDescriptor ];
		effects[ 1 ]();

		simulateSaveCycle( { publishAfterSave: true } );

		await Promise.resolve();

		expect( mockClosePublishSidebar ).not.toHaveBeenCalled();
	} );

	it( 'should not show celebration when updating an already-published post', async () => {
		mockFunctionDescriptor = 'update_existing';
		mockFirstPostRef.current = false;
		mockFetchPromiseRef.current = Promise.resolve();
		mockIsCurrentPostPublished = true;
		setupRefs();

		OnboardingNextStepAfterPublishingPost();

		const effects = mockUseEffectFunctions[ mockFunctionDescriptor ];
		effects[ 1 ]();

		simulateSaveCycle();

		await Promise.resolve();

		expect( mockClosePublishSidebar ).not.toHaveBeenCalled();
	} );

	it( 'should still detect publish after a non-publish save cycle', async () => {
		mockFunctionDescriptor = 'retry_after_draft';
		mockFirstPostRef.current = false;
		mockFetchPromiseRef.current = Promise.resolve();
		setupRefs();

		OnboardingNextStepAfterPublishingPost();

		const effects = mockUseEffectFunctions[ mockFunctionDescriptor ];
		effects[ 1 ]();

		simulateSaveCycle( { publishAfterSave: false } );

		await Promise.resolve();
		expect( mockClosePublishSidebar ).not.toHaveBeenCalled();

		simulateSaveCycle( { publishAfterSave: true } );

		await Promise.resolve();
		expect( mockClosePublishSidebar ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should wait for launchpad fetch before showing celebration', async () => {
		mockFunctionDescriptor = 'slow_fetch';

		let resolveFetch;
		const slowPromise = new Promise( ( resolve ) => {
			resolveFetch = resolve;
		} );
		mockFetchPromiseRef.current = slowPromise;
		mockFirstPostRef.current = null;
		setupRefs();

		OnboardingNextStepAfterPublishingPost();

		const effects = mockUseEffectFunctions[ mockFunctionDescriptor ];
		effects[ 1 ]();

		simulateSaveCycle( { publishAfterSave: true } );

		await Promise.resolve();
		expect( mockClosePublishSidebar ).not.toHaveBeenCalled();

		mockFirstPostRef.current = false;
		resolveFetch();
		await Promise.resolve();

		expect( mockClosePublishSidebar ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should handle launchpad fetch failure gracefully', async () => {
		mockFunctionDescriptor = 'fetch_error';
		mockApiFetchResult = Promise.reject( new Error( 'Network error' ) );
		setupRefs();

		OnboardingNextStepAfterPublishingPost();

		const effects = mockUseEffectFunctions[ mockFunctionDescriptor ];
		effects[ 0 ]();

		await Promise.resolve();
		await Promise.resolve();

		expect( mockFirstPostRef.current ).toBe( false );
	} );

	it( 'should not show celebration when launchpad fetch is still pending', async () => {
		mockFunctionDescriptor = 'fetch_pending';
		mockFirstPostRef.current = null;
		mockFetchPromiseRef.current = null;
		setupRefs();

		OnboardingNextStepAfterPublishingPost();

		const effects = mockUseEffectFunctions[ mockFunctionDescriptor ];
		effects[ 1 ]();

		simulateSaveCycle( { publishAfterSave: true } );

		await Promise.resolve();

		expect( mockClosePublishSidebar ).not.toHaveBeenCalled();
	} );

	it( 'should not fire celebration after unmount', async () => {
		mockFunctionDescriptor = 'unmount_guard';

		let resolveFetch;
		const slowPromise = new Promise( ( resolve ) => {
			resolveFetch = resolve;
		} );
		mockFetchPromiseRef.current = slowPromise;
		mockFirstPostRef.current = null;
		setupRefs();

		OnboardingNextStepAfterPublishingPost();

		const effects = mockUseEffectFunctions[ mockFunctionDescriptor ];
		const cleanup = effects[ 1 ]();

		simulateSaveCycle( { publishAfterSave: true } );

		// Unmount before fetch resolves.
		cleanup();

		mockFirstPostRef.current = false;
		resolveFetch();
		await Promise.resolve();

		expect( mockClosePublishSidebar ).not.toHaveBeenCalled();
	} );
} );
