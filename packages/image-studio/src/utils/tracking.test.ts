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
	trackImageStudioReelShareDispatched,
	trackImageStudioReelShareFailed,
	trackImageStudioReelShareConnectionDisabled,
	trackImageStudioGenericShareClicked,
	trackImageStudioGenericShareCompleted,
	trackImageStudioGenericShareFailed,
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

	it( 'fires reel_share_clicked with attachment_id and duration_seconds', () => {
		trackImageStudioReelShareClicked( { attachmentId: 555, durationSeconds: 12 } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_reel_share_clicked',
			expect.objectContaining( { attachment_id: 555, duration_seconds: 12 } )
		);
	} );

	it( 'fires reel_share_clicked without duration_seconds when not provided', () => {
		trackImageStudioReelShareClicked( { attachmentId: 555 } );
		const call = recordTracksEventMock.mock.calls[ 0 ];
		expect( call[ 0 ] ).toBe( 'jetpack_big_sky_image_studio_reel_share_clicked' );
		expect( call[ 1 ] ).not.toHaveProperty( 'duration_seconds' );
	} );

	it( 'fires reel_share_not_connected', () => {
		trackImageStudioReelShareNotConnected();
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_reel_share_not_connected',
			expect.any( Object )
		);
	} );

	it( 'fires reel_share_post_not_published', () => {
		trackImageStudioReelShareNotPublished();
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_reel_share_post_not_published',
			expect.any( Object )
		);
	} );

	it( 'fires reel_share_invalid_state', () => {
		trackImageStudioReelShareInvalidState();
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_reel_share_invalid_state',
			expect.any( Object )
		);
	} );

	it( 'fires reel_share_dispatched', () => {
		trackImageStudioReelShareDispatched();
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_reel_share_dispatched',
			expect.any( Object )
		);
	} );

	it( 'fires reel_share_failed with error_message when provided', () => {
		trackImageStudioReelShareFailed( 'boom' );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_reel_share_failed',
			expect.objectContaining( { error_message: 'boom' } )
		);
	} );

	it( 'fires reel_share_failed without error_message when omitted', () => {
		trackImageStudioReelShareFailed();
		const call = recordTracksEventMock.mock.calls[ 0 ];
		expect( call[ 0 ] ).toBe( 'jetpack_big_sky_image_studio_reel_share_failed' );
		expect( call[ 1 ] ).not.toHaveProperty( 'error_message' );
	} );

	it( 'fires reel_share_connection_disabled', () => {
		trackImageStudioReelShareConnectionDisabled();
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_reel_share_connection_disabled',
			expect.any( Object )
		);
	} );

	it( 'preserves a duration_seconds value of 0', () => {
		trackImageStudioReelShareClicked( { attachmentId: 1, durationSeconds: 0 } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_reel_share_clicked',
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

	it( 'fires generic_share_clicked with method=web-share', () => {
		trackImageStudioGenericShareClicked( { method: 'web-share' } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_generic_share_clicked',
			expect.objectContaining( { method: 'web-share' } )
		);
	} );

	it( 'fires generic_share_clicked with method=web-share-unsupported', () => {
		trackImageStudioGenericShareClicked( { method: 'web-share-unsupported' } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_generic_share_clicked',
			expect.objectContaining( { method: 'web-share-unsupported' } )
		);
	} );

	it( 'fires generic_share_clicked with method=download', () => {
		trackImageStudioGenericShareClicked( { method: 'download' } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_generic_share_clicked',
			expect.objectContaining( { method: 'download' } )
		);
	} );

	it( 'fires generic_share_completed with the chosen method', () => {
		trackImageStudioGenericShareCompleted( { method: 'web-share' } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_generic_share_completed',
			expect.objectContaining( { method: 'web-share' } )
		);
	} );

	it( 'fires generic_share_failed with method only', () => {
		trackImageStudioGenericShareFailed( { method: 'web-share-unsupported' } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_generic_share_failed',
			expect.objectContaining( { method: 'web-share-unsupported' } )
		);
	} );

	it( 'fires generic_share_failed with method, message, and failureKind', () => {
		trackImageStudioGenericShareFailed( {
			method: 'download',
			message: 'window.open returned null',
			failureKind: 'open-blocked',
		} );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_generic_share_failed',
			expect.objectContaining( {
				method: 'download',
				error_message: 'window.open returned null',
				failure_kind: 'open-blocked',
			} )
		);
	} );
} );
