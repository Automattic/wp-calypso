/**
 * External dependencies
 */
import { expect } from 'chai';
import { noop } from 'lodash';
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { AspectRatios } from 'state/ui/editor/image-editor/constants';
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'EditGravatar', function() {
	let EditGravatar,
		FilePicker,
		Gravatar,
		ImageEditor,
		sandbox;
	const user = {
		email_verified: false
	};

	useFakeDom();
	useMockery( mockery => {
		mockery.registerMock( 'lib/oauth-token', {
			getToken: () => 'bearerToken'
		} );
		mockery.registerSubstitute( 'event', 'component-event' );
		mockery.registerSubstitute( 'matches-selector', 'component-matches-selector' );
	} );
	useSandbox( newSandbox => {
		sandbox = newSandbox;
		global.URL = {
			revokeObjectURL: sandbox.stub(),
			createObjectURL: sandbox.stub()
		};
	} );

	before( function() {
		EditGravatar = require( 'blocks/edit-gravatar' ).EditGravatar;
		FilePicker = require( 'components/file-picker' );
		Gravatar = require( 'components/gravatar' ).default;
		ImageEditor = require( 'blocks/image-editor' );
	} );

	describe( 'component rendering', () => {
		it( 'displays a Gravatar', () => {
			const wrapper = shallow(
				<EditGravatar
					translate={ noop }
					user={ user }
				/>
			);
			expect( wrapper.find( Gravatar ).length ).to.equal( 1 );
		} );

		it( 'contains a file picker that accepts images', () => {
			const wrapper = shallow(
				<EditGravatar
					translate={ noop }
					user={ user }
				/>
			);
			const filePicker = wrapper.find( FilePicker );
			expect( filePicker.length ).to.equal( 1 );
			expect( filePicker.prop( 'accept' ) ).to.equal( 'image/*' );
		} );

		it( 'does not display the image editor by default', () => {
			const wrapper = shallow(
				<EditGravatar
					translate={ noop }
					user={ user }
				/>
			);
			expect( wrapper.find( ImageEditor ).length ).to.equal( 0 );
		} );
	} );

	describe( 'getting a file from user', () => {
		describe( 'accepted file type', () => {
			it( 'displays the image editor with square allowed aspect ratio', () => {
				const wrapper = shallow(
					<EditGravatar
						translate={ noop }
						user={ user }
					/>
				);
				const files = [ {
					name: 'filename.png'
				} ];

				wrapper.instance().onReceiveFile( files );

				const imageEditor = wrapper.update().find( ImageEditor );
				expect( imageEditor.length ).to.equal( 1 );

				const aspectRatioResult = imageEditor.prop( 'allowedAspectRatios' );
				expect( aspectRatioResult ).to.eql( [ AspectRatios.ASPECT_1X1 ] );
			} );
		} );

		describe( 'bad file type', () => {
			it( 'does not display editor, and calls error action creator', () => {
				const receiveGravatarImageFailedSpy = sandbox.spy();
				const wrapper = shallow(
					<EditGravatar
						receiveGravatarImageFailed={ receiveGravatarImageFailedSpy }
						translate={ noop }
						user={ user }
					/>
				);
				const files = [ {
					name: 'filename.tiff'
				} ];

				wrapper.instance().onReceiveFile( files );

				expect( wrapper.update().find( ImageEditor ).length ).to.equal( 0 );
				expect( receiveGravatarImageFailedSpy ).to.have.been.calledOnce;
			} );
		} );
	} );

	describe( 'after editing image', () => {
		const imageEditorProps = {
			resetAllImageEditorState: noop
		};
		const files = [ {
			name: 'filename.png'
		} ];

		it( 'given no error, hides image editor and calls upload gravatar action creator', () => {
			const receiveGravatarImageFailedSpy = sandbox.spy();
			const uploadGravatarSpy = sandbox.spy();
			const wrapper = shallow(
				<EditGravatar
					receiveGravatarImageFailed={ receiveGravatarImageFailedSpy }
					resetAllImageEditorState={ noop }
					translate={ noop }
					uploadGravatar={ uploadGravatarSpy }
					user={ user }
				/>
			);

			wrapper.instance().onReceiveFile( files );
			wrapper.instance().onImageEditorDone( null, 'image', imageEditorProps );

			expect( wrapper.update().find( ImageEditor ).length ).to.equal( 0 );
			expect( uploadGravatarSpy ).to.have.been.calledOnce;
			expect( receiveGravatarImageFailedSpy.callCount ).to.equal( 0 );
		} );

		it( 'given an error, hides image editor and calls error notice action creator', () => {
			const error = new Error();
			const receiveGravatarImageFailedSpy = sandbox.spy();
			const uploadGravatarSpy = sandbox.spy();
			const wrapper = shallow(
				<EditGravatar
					receiveGravatarImageFailed={ receiveGravatarImageFailedSpy }
					resetAllImageEditorState={ noop }
					translate={ noop }
					uploadGravatar={ uploadGravatarSpy }
					user={ user }
				/>
			);

			wrapper.instance().onReceiveFile( files );
			wrapper.instance().onImageEditorDone( error, 'image', imageEditorProps );

			expect( wrapper.update().find( ImageEditor ).length ).to.equal( 0 );
			expect( receiveGravatarImageFailedSpy ).to.have.been.calledOnce;
			expect( uploadGravatarSpy.callCount ).to.equal( 0 );
		} );
	} );
} );
