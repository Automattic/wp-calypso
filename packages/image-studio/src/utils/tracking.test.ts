/**
 * @jest-environment jsdom
 *
 * Tests for Image Studio tracking functions
 */
import { recordTracksEvent as recordTracksEventBase } from '@automattic/calypso-analytics';
import { select } from '@wordpress/data';
import { ImageStudioEntryPoint } from '../store';
import { trackImageStudioClosed, trackImageStudioOpened } from './tracking';

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
