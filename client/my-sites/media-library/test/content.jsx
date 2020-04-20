/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { MediaLibraryContent } from 'my-sites/media-library/content';
import { ValidationErrors } from 'lib/media/constants';
import MediaActions from 'lib/media/actions';

jest.mock( 'lib/media/actions' );

const googleConnection = {
	service: 'google_photos',
	status: 'ok',
};

const googleConnectionInvalid = {
	service: 'google_photos',
	status: 'invalid',
};

const mediaValidationErrorTypes = [ ValidationErrors.SERVICE_AUTH_FAILED ];

function getMediaContent( props ) {
	return shallow(
		<MediaLibraryContent
			mediaValidationErrorTypes={ [] }
			translate={ noop }
			site={ { ID: 1 } }
			{ ...props }
		/>
	);
}

function getMediaContentInstance( props ) {
	return getMediaContent( props ).instance();
}

describe( 'MediaLibraryContent', () => {
	let beforeWindow;

	beforeAll( function () {
		beforeWindow = global.window;
		global.window = {};
	} );

	afterAll( function () {
		global.window = beforeWindow;
	} );

	describe( 'isGoogleConnectedAndVisible', () => {
		test( 'returns true when connected using google source', () => {
			const props = {
				googleConnection,
				source: 'google_photos',
			};
			const wrapper = getMediaContentInstance();

			expect( wrapper.isGoogleConnectedAndVisible( props ) ).toBe( true );
		} );

		test( 'returns false when not connected and using google source', () => {
			const props = {
				googleConnection,
				source: '',
			};
			const wrapper = getMediaContentInstance();

			expect( wrapper.isGoogleConnectedAndVisible( props ) ).toBe( false );
		} );

		test( 'returns false when using google source and not connected', () => {
			const props = {
				googleConnection: null,
				source: 'google_photos',
			};
			const wrapper = getMediaContentInstance();

			expect( wrapper.isGoogleConnectedAndVisible( props ) ).toBe( false );
		} );
	} );

	describe( 'hasGoogleExpired', () => {
		test( 'returns false when no media errors and google service', () => {
			const props = {
				mediaValidationErrorTypes: [],
				source: 'google_photos',
			};
			const wrapper = getMediaContentInstance();

			expect( wrapper.hasGoogleExpired( props ) ).toBe( false );
		} );

		test( 'returns false when media errors and not google service', () => {
			const props = {
				mediaValidationErrorTypes,
				source: '',
			};
			const wrapper = getMediaContentInstance();

			expect( wrapper.hasGoogleExpired( props ) ).toBe( false );
		} );

		test( 'returns true when media errors and google service', () => {
			const props = {
				mediaValidationErrorTypes,
				source: 'google_photos',
			};
			const wrapper = getMediaContentInstance();

			expect( wrapper.hasGoogleExpired( props ) ).toBe( true );
		} );
	} );

	describe( 'needsToBeConnected', () => {
		test( 'returns false when default service and not connected', () => {
			const props = {
				source: '',
				mediaValidationErrorTypes,
				isConnected: false,
				googleConnection: null,
			};
			const wrapper = getMediaContentInstance( props );

			expect( wrapper.needsToBeConnected() ).toBe( false );
		} );

		test( 'returns false when google service, connected, and not expired', () => {
			const props = {
				source: 'google_photos',
				mediaValidationErrorTypes: [],
				isConnected: true,
				googleConnection,
			};
			const wrapper = getMediaContentInstance( props );

			expect( wrapper.needsToBeConnected() ).toBe( false );
		} );

		test( 'returns false when not google service, is connected, and expired', () => {
			const props = {
				source: 'example',
				mediaValidationErrorTypes,
				isConnected: true,
				googleConnection,
			};
			const wrapper = getMediaContentInstance( props );

			expect( wrapper.needsToBeConnected() ).toBe( false );
		} );

		test( 'returns true when google service, not connected, and expired', () => {
			const props = {
				source: 'google_photos',
				mediaValidationErrorTypes,
				isConnected: false,
				googleConnection,
			};
			const wrapper = getMediaContentInstance( props );

			expect( wrapper.needsToBeConnected() ).toBe( true );
		} );

		test( 'returns true when google service, not connected, and not expired', () => {
			const props = {
				source: 'google_photos',
				mediaValidationErrorTypes: [],
				isConnected: false,
				googleConnection,
			};
			const wrapper = getMediaContentInstance( props );

			expect( wrapper.needsToBeConnected() ).toBe( true );
		} );
	} );

	describe( 'componentDidUpdate', () => {
		test( 'deleteKeyringConnection issued when google service goes from ok to expired', () => {
			const props = { source: 'google_photos', isConnected: true, googleConnection };
			const wrapper = getMediaContent( props );
			const deleteKeyringConnection = jest.fn();

			wrapper.setProps( { mediaValidationErrorTypes, deleteKeyringConnection } );

			expect( deleteKeyringConnection.mock.calls.length ).toEqual( 1 );
		} );

		test( 'deleteKeyringConnection not issued if no service expires', () => {
			const props = { source: 'google_photos', isConnected: true, googleConnection };
			const wrapper = getMediaContent( props );
			const deleteKeyringConnection = jest.fn();

			wrapper.setProps( { deleteKeyringConnection } );

			expect( deleteKeyringConnection.mock.calls.length ).toEqual( 0 );
		} );

		test( 'sourceChanged issued when expired google service goes from invalid to ok', () => {
			const propsBefore = {
				source: 'google_photos',
				isConnected: false,
				googleConnection: null,
				mediaValidationErrorTypes,
			};
			const propsAfter = {
				source: 'google_photos',
				isConnected: false,
				googleConnection,
			};
			const wrapper = getMediaContent( propsBefore );

			MediaActions.sourceChanged.mockReset();
			wrapper.setProps( propsAfter );

			expect( MediaActions.sourceChanged.mock.calls.length ).toEqual( 1 );
		} );

		test( 'sourceChanged not issued when google service remains constant', () => {
			const propsBefore = {
				source: 'google_photos',
				isConnected: false,
				googleConnection: googleConnectionInvalid,
			};
			const wrapper = getMediaContent( propsBefore );

			MediaActions.sourceChanged.mockReset();
			wrapper.setProps( propsBefore );

			expect( MediaActions.sourceChanged.mock.calls.length ).toEqual( 0 );
		} );
	} );
} );
