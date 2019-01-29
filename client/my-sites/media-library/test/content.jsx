/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { MediaLibraryContent } from 'my-sites/media-library/content';
import { ValidationErrors } from 'lib/media/constants';
import MediaActions from 'lib/media/actions';

jest.mock( 'lib/media/actions' );

const googleConnections = [
	{
		service: 'something',
		status: 'ok',
	},
	{
		service: 'google_photos',
		status: 'ok',
	},
];
const googleConnectionsInvalid = [
	{
		service: 'something',
		status: 'ok',
	},
	{
		service: 'google_photos',
		status: 'invalid',
	},
];
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
	describe( 'getGoogleStatus', () => {
		test( 'returns google status when using google source', () => {
			const props = {
				connections: googleConnections,
				source: 'google_photos',
			};
			const wrapper = getMediaContentInstance();

			expect( wrapper.getGoogleStatus( props ) ).to.be.equal( 'ok' );
		} );

		test( 'returns null when not using google source', () => {
			const props = {
				connections: googleConnections,
				source: '',
			};
			const wrapper = getMediaContentInstance();

			expect( wrapper.getGoogleStatus( props ) ).to.be.equal( null );
		} );

		test( 'returns null when using google but not connected', () => {
			const props = {
				connections: [],
				source: 'google_photos',
			};
			const wrapper = getMediaContentInstance();

			expect( wrapper.getGoogleStatus( props ) ).to.be.equal( null );
		} );
	} );

	describe( 'hasGoogleServiceExpired', () => {
		test( 'returns false when no media errors and google service', () => {
			const props = {
				mediaValidationErrorTypes: [],
				source: 'google_photos',
			};
			const wrapper = getMediaContentInstance();

			expect( wrapper.hasGoogleServiceExpired( props ) ).to.be.equal( false );
		} );

		test( 'returns false when media errors and not google service', () => {
			const props = {
				mediaValidationErrorTypes,
				source: '',
			};
			const wrapper = getMediaContentInstance();

			expect( wrapper.hasGoogleServiceExpired( props ) ).to.be.equal( false );
		} );

		test( 'returns true when media errors and google service', () => {
			const props = {
				mediaValidationErrorTypes,
				source: 'google_photos',
			};
			const wrapper = getMediaContentInstance();

			expect( wrapper.hasGoogleServiceExpired( props ) ).to.be.equal( true );
		} );
	} );

	describe( 'needsToBeConnected', () => {
		test( 'returns false when default service', () => {
			const props = {
				source: '',
				mediaValidationErrorTypes,
				isConnected: false,
				connections: googleConnections,
			};
			const wrapper = getMediaContentInstance( props );

			expect( wrapper.needsToBeConnected() ).to.be.equal( false );
		} );

		test( 'returns false when google service and already connected', () => {
			const props = {
				source: 'google_photos',
				mediaValidationErrorTypes,
				isConnected: true,
				connections: googleConnections,
			};
			const wrapper = getMediaContentInstance( props );

			expect( wrapper.needsToBeConnected() ).to.be.equal( false );
		} );

		test( 'returns false when example service, not connected, and expired', () => {
			const props = {
				source: 'example',
				mediaValidationErrorTypes,
				isConnected: false,
				connections: googleConnections,
			};
			const wrapper = getMediaContentInstance( props );

			expect( wrapper.needsToBeConnected() ).to.be.equal( false );
		} );

		test( 'returns true when google service, not connected, and expired', () => {
			const props = {
				source: 'google_photos',
				mediaValidationErrorTypes,
				isConnected: false,
				connections: googleConnections,
			};
			const wrapper = getMediaContentInstance( props );

			expect( wrapper.needsToBeConnected() ).to.be.equal( true );
		} );
	} );

	describe( 'componentDidUpdate', () => {
		test( 'requestKeyringConnections issued when google service goes from ok to expired', () => {
			const props = { source: 'google_photos', isConnected: true, connections: googleConnections };
			const wrapper = getMediaContent( props );
			const requestKeyringConnections = jest.fn();

			wrapper.setProps( { mediaValidationErrorTypes, requestKeyringConnections } );

			expect( requestKeyringConnections.mock.calls.length ).to.be.equal( 1 );
		} );

		test( 'requestKeyringConnections not issued if no service expires', () => {
			const props = { source: 'google_photos', isConnected: true, connections: googleConnections };
			const wrapper = getMediaContent( props );
			const requestKeyringConnections = jest.fn();

			wrapper.setProps( { requestKeyringConnections } );

			expect( requestKeyringConnections.mock.calls.length ).to.be.equal( 0 );
		} );

		test( 'sourceChanged issued when expired google service goes from invalid to ok', () => {
			const propsBefore = {
				source: 'google_photos',
				isConnected: false,
				connections: googleConnectionsInvalid,
			};
			const propsAfter = {
				source: 'google_photos',
				isConnected: false,
				connections: googleConnections,
			};
			const wrapper = getMediaContent( propsBefore );

			MediaActions.sourceChanged.mockReset();
			wrapper.setProps( propsAfter );

			expect( MediaActions.sourceChanged.mock.calls.length ).to.be.equal( 1 );
		} );

		test( 'sourceChanged not issued when google service remains constant', () => {
			const propsBefore = {
				source: 'google_photos',
				isConnected: false,
				connections: googleConnectionsInvalid,
			};
			const wrapper = getMediaContent( propsBefore );

			MediaActions.sourceChanged.mockReset();
			wrapper.setProps( propsBefore );

			expect( MediaActions.sourceChanged.mock.calls.length ).to.be.equal( 0 );
		} );
	} );
} );
