/**
 * @jest-environment jsdom
 *
 * Tests for Image Studio tracking functions
 */
import { recordTracksEvent as recordTracksEventBase } from '@automattic/calypso-analytics';
import { select } from '@wordpress/data';
import { ImageStudioEntryPoint } from '../store';
import {
	trackImageStudioClosed,
	trackImageStudioOpened,
	trackImageStudioReelShareClicked,
	trackImageStudioReelShareNotConnected,
	trackImageStudioReelShareNotPublished,
	trackImageStudioReelShareInvalidState,
	trackImageStudioReelShareCancelled,
	trackImageStudioReelShareDispatched,
	trackImageStudioReelShareFailed,
	trackImageStudioReelShareConnectionDisabled,
	trackImageStudioGenericShareClicked,
	trackImageStudioGenericShareCompleted,
	trackImageStudioGenericShareFailed,
	trackImageStudioFeatureClipAddedToPost,
	trackImageStudioFeatureClipPanelViewed,
} from './tracking';

// Mock session
jest.mock( '../utils/session', () => ( {
	getSessionId: jest.fn( () => 'test-session-id' ),
} ) );

const recordTracksEventMock = recordTracksEventBase as jest.Mock;
const selectMock = select as jest.Mock;

describe( 'trackImageStudioOpened', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		selectMock.mockReturnValue( {
			getEntryPoint: jest.fn( () => null ),
		} );
		// Set up window properties for screen/post_type
		( window as any ).pagenow = 'post';
		( window as any ).typenow = 'page';
	} );

	afterEach( () => {
		delete ( window as any ).pagenow;
		delete ( window as any ).typenow;
	} );

	it( 'should include sessionid in the opened event', () => {
		trackImageStudioOpened( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_opened',
			expect.objectContaining( { sessionid: 'test-session-id' } )
		);
	} );

	it( 'should include screen and post_type from window globals', () => {
		trackImageStudioOpened( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_opened',
			expect.objectContaining( {
				screen: 'post',
				post_type: 'page',
			} )
		);
	} );

	it( 'should use the passed entryPoint as placement when store has no value', () => {
		// At open time the store has not been updated yet, so it returns null
		selectMock.mockReturnValue( {
			getEntryPoint: jest.fn( () => null ),
		} );

		trackImageStudioOpened( {
			mode: 'generate',
			entryPoint: ImageStudioEntryPoint.EditorBlock,
		} );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_opened',
			expect.objectContaining( { placement: 'editor_block' } )
		);
	} );

	it( 'should include mode and attachment_id', () => {
		trackImageStudioOpened( {
			mode: 'edit',
			attachmentId: 42,
			entryPoint: ImageStudioEntryPoint.MediaLibrary,
		} );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_opened',
			expect.objectContaining( {
				mode: 'edit',
				attachment_id: 42,
			} )
		);
	} );
} );

describe( 'recordImageStudioEvent — tracking context properties', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		selectMock.mockReturnValue( {
			getEntryPoint: jest.fn( () => null ),
		} );
		delete ( window as any ).imageStudioData;
	} );

	afterEach( () => {
		delete ( window as any ).imageStudioData;
	} );

	it( 'should include blog_id, site_type, and is_a11n from imageStudioData', () => {
		( window as any ).imageStudioData = {
			blogId: 1234,
			siteType: 'atomic',
			isA11n: true,
		};

		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( {
				blog_id: 1234,
				site_type: 'atomic',
				is_a11n: true,
			} )
		);
	} );

	it( 'should parse blogId when it is provided as a string', () => {
		( window as any ).imageStudioData = {
			blogId: '5678',
			siteType: 'simple',
		};

		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( {
				blog_id: 5678,
				site_type: 'simple',
			} )
		);
	} );

	it( 'should normalize legacy wpcom and woa site type values', () => {
		( window as any ).imageStudioData = { siteType: 'woa' };

		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( { site_type: 'atomic' } )
		);

		jest.clearAllMocks();
		( window as any ).imageStudioData = { siteType: 'wpcom' };

		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( { site_type: 'simple' } )
		);
	} );

	it( 'should default site_type to jetpack and is_a11n to false', () => {
		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( {
				site_type: 'jetpack',
				is_a11n: false,
			} )
		);
	} );

	it( 'should omit blog_id when blogId is unavailable or invalid', () => {
		( window as any ).imageStudioData = {
			blogId: 'not-a-number',
			siteType: 'jetpack',
		};

		trackImageStudioClosed( { mode: 'edit' } );

		const call = recordTracksEventMock.mock.calls[ 0 ];
		expect( call[ 0 ] ).toBe( 'jetpack_big_sky_image_studio_closed' );
		expect( call[ 1 ] ).not.toHaveProperty( 'blog_id' );
		expect( call[ 1 ] ).toMatchObject( { site_type: 'jetpack' } );
	} );
} );

describe( 'recordImageStudioEvent — is_test property', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		selectMock.mockReturnValue( {
			getEntryPoint: jest.fn( () => null ),
		} );
		delete ( window as any ).imageStudioData;
		delete ( window as any ).pagenow;
		delete ( window as any ).typenow;
	} );

	afterEach( () => {
		delete ( window as any ).imageStudioData;
	} );

	it( 'should include is_test when imageStudioData.isDevMode is true', () => {
		( window as any ).imageStudioData = { enabled: true, isDevMode: true };

		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( { is_test: true } )
		);
	} );

	it( 'should include is_test as false when imageStudioData.isDevMode is false', () => {
		( window as any ).imageStudioData = { enabled: true, isDevMode: false };

		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( { is_test: false } )
		);
	} );

	it( 'should default is_test to false when imageStudioData is absent', () => {
		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( { is_test: false } )
		);
	} );

	it( 'should default is_test to false when isDevMode is not set', () => {
		( window as any ).imageStudioData = { enabled: true };

		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( { is_test: false } )
		);
	} );
} );

describe( 'reel share tracking helpers', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		selectMock.mockReturnValue( {
			getEntryPoint: jest.fn( () => 'post_editor_feature_clip' ),
		} );
	} );

	it( 'fires feature_clip_share_clicked with surface, attachment_id and duration_seconds', () => {
		trackImageStudioReelShareClicked( {
			surface: 'sidebar',
			attachmentId: 555,
			durationSeconds: 12,
		} );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_feature_clip_share_clicked',
			expect.objectContaining( { surface: 'sidebar', attachment_id: 555, duration_seconds: 12 } )
		);
	} );

	it( 'fires feature_clip_share_clicked without duration_seconds when not provided', () => {
		trackImageStudioReelShareClicked( { surface: 'modal', attachmentId: 555 } );
		const call = recordTracksEventMock.mock.calls[ 0 ];
		expect( call[ 0 ] ).toBe( 'jetpack_big_sky_image_studio_feature_clip_share_clicked' );
		expect( call[ 1 ] ).not.toHaveProperty( 'duration_seconds' );
		expect( call[ 1 ] ).toMatchObject( { surface: 'modal' } );
	} );

	it( 'fires feature_clip_share_not_connected with surface', () => {
		trackImageStudioReelShareNotConnected( { surface: 'sidebar' } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_feature_clip_share_not_connected',
			expect.objectContaining( { surface: 'sidebar' } )
		);
	} );

	it( 'fires feature_clip_share_post_not_published with surface', () => {
		trackImageStudioReelShareNotPublished( { surface: 'modal' } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_feature_clip_share_post_not_published',
			expect.objectContaining( { surface: 'modal' } )
		);
	} );

	it( 'fires feature_clip_share_invalid_state with surface', () => {
		trackImageStudioReelShareInvalidState( { surface: 'sidebar' } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_feature_clip_share_invalid_state',
			expect.objectContaining( { surface: 'sidebar' } )
		);
	} );

	it( 'fires feature_clip_share_dispatched with surface', () => {
		trackImageStudioReelShareDispatched( { surface: 'modal' } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_feature_clip_share_dispatched',
			expect.objectContaining( { surface: 'modal' } )
		);
	} );

	it( 'fires feature_clip_share_cancelled with surface', () => {
		trackImageStudioReelShareCancelled( { surface: 'sidebar' } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_feature_clip_share_cancelled',
			expect.objectContaining( { surface: 'sidebar' } )
		);
	} );

	it( 'fires feature_clip_share_failed with surface and error_message when provided', () => {
		trackImageStudioReelShareFailed( { surface: 'modal', errorMessage: 'boom' } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_feature_clip_share_failed',
			expect.objectContaining( { surface: 'modal', error_message: 'boom' } )
		);
	} );

	it( 'fires feature_clip_share_failed without error_message when omitted', () => {
		trackImageStudioReelShareFailed( { surface: 'sidebar' } );
		const call = recordTracksEventMock.mock.calls[ 0 ];
		expect( call[ 0 ] ).toBe( 'jetpack_big_sky_image_studio_feature_clip_share_failed' );
		expect( call[ 1 ] ).not.toHaveProperty( 'error_message' );
		expect( call[ 1 ] ).toMatchObject( { surface: 'sidebar' } );
	} );

	it( 'fires feature_clip_share_connection_disabled with surface', () => {
		trackImageStudioReelShareConnectionDisabled( { surface: 'modal' } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_feature_clip_share_connection_disabled',
			expect.objectContaining( { surface: 'modal' } )
		);
	} );

	it( 'preserves a duration_seconds value of 0', () => {
		trackImageStudioReelShareClicked( { surface: 'modal', attachmentId: 1, durationSeconds: 0 } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_feature_clip_share_clicked',
			expect.objectContaining( { duration_seconds: 0 } )
		);
	} );
} );

describe( 'generic share tracking helpers', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		selectMock.mockReturnValue( {
			getEntryPoint: jest.fn( () => 'post_editor_feature_clip' ),
		} );
	} );

	it( 'fires feature_clip_generic_share_clicked with surface and method=web-share', () => {
		trackImageStudioGenericShareClicked( { surface: 'sidebar', method: 'web-share' } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_feature_clip_generic_share_clicked',
			expect.objectContaining( { surface: 'sidebar', method: 'web-share' } )
		);
	} );

	it( 'fires feature_clip_generic_share_clicked with surface and method=web-share-unsupported', () => {
		trackImageStudioGenericShareClicked( { surface: 'modal', method: 'web-share-unsupported' } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_feature_clip_generic_share_clicked',
			expect.objectContaining( { surface: 'modal', method: 'web-share-unsupported' } )
		);
	} );

	it( 'fires feature_clip_generic_share_completed with surface and the chosen method', () => {
		trackImageStudioGenericShareCompleted( { surface: 'sidebar', method: 'web-share' } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_feature_clip_generic_share_completed',
			expect.objectContaining( { surface: 'sidebar', method: 'web-share' } )
		);
	} );

	it( 'fires feature_clip_generic_share_failed with surface and method only', () => {
		trackImageStudioGenericShareFailed( { surface: 'modal', method: 'web-share-unsupported' } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_feature_clip_generic_share_failed',
			expect.objectContaining( { surface: 'modal', method: 'web-share-unsupported' } )
		);
	} );

	it( 'fires feature_clip_generic_share_failed with surface, method, message, and failureKind=http on a fetch failure', () => {
		trackImageStudioGenericShareFailed( {
			surface: 'sidebar',
			method: 'web-share',
			message: 'Fetch failed: 404',
			failureKind: 'http',
		} );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_feature_clip_generic_share_failed',
			expect.objectContaining( {
				surface: 'sidebar',
				method: 'web-share',
				error_message: 'Fetch failed: 404',
				failure_kind: 'http',
			} )
		);
	} );
} );

describe( 'feature clip tracking helpers', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		selectMock.mockReturnValue( {
			getEntryPoint: jest.fn( () => 'post_editor_feature_clip' ),
		} );
	} );

	it( 'fires feature_clip_added_to_post with attachment_id and surface=sidebar', () => {
		trackImageStudioFeatureClipAddedToPost( { attachmentId: 88 } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_feature_clip_added_to_post',
			expect.objectContaining( { attachment_id: 88, surface: 'sidebar' } )
		);
	} );

	it( 'fires feature_clip_panel_viewed with the base props', () => {
		trackImageStudioFeatureClipPanelViewed();
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_feature_clip_panel_viewed',
			expect.objectContaining( { sessionid: 'test-session-id' } )
		);
	} );
} );
