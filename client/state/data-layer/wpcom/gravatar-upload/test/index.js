/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon, { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { uploadGravatar, announceSuccess, announceFailure } from '../';
import {
	GRAVATAR_UPLOAD_RECEIVE,
	GRAVATAR_UPLOAD_REQUEST_SUCCESS,
	GRAVATAR_UPLOAD_REQUEST_FAILURE,
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { useSandbox } from 'test/helpers/use-sinon';

describe( '#uploadGravatar()', () => {
	test( 'dispatches an HTTP request to the gravatar upload endpoint', () => {
		const action = {
			type: 'DUMMY_ACTION',
			file: 'file',
			email: 'email',
		};

		const result = uploadGravatar( action );

		expect( result ).to.eql(
			http(
				{
					apiNamespace: 'wpcom/v2',
					method: 'POST',
					body: {},
					path: '/gravatar-upload',
					formData: [ [ 'account', 'email' ], [ 'filedata', 'file' ] ],
				},
				action
			)
		);
	} );
} );

describe( '#announceSuccess()', () => {
	let sandbox;
	const noop = () => {};

	const tempImageSrc = 'tempImageSrc';
	useSandbox( newSandbox => {
		sandbox = newSandbox;
		global.FormData = sandbox.stub().returns( {
			append: noop,
		} );
		global.FileReader = sandbox.stub().returns( {
			readAsDataURL: noop,
			addEventListener: function( event, callback ) {
				this.result = tempImageSrc;
				callback();
			},
		} );
	} );

	test( 'dispatches a success action when the file is read', () => {
		const action = {
			type: 'DUMMY_ACTION',
			file: 'file',
			email: 'email',
		};
		const dispatch = spy();

		announceSuccess( action, noop, { success: true } )( dispatch );
		expect( dispatch ).to.have.been.calledWith(
			sinon.match( { type: GRAVATAR_UPLOAD_REQUEST_SUCCESS } )
		);
	} );

	test( 'dispatches a upload received action with the image data when the file is read', () => {
		const action = {
			type: 'DUMMY_ACTION',
			file: 'file',
			email: 'email',
		};
		const dispatch = spy();

		announceSuccess( action, noop, { success: true } )( dispatch );
		expect( dispatch ).to.have.been.calledWith(
			sinon.match( { type: GRAVATAR_UPLOAD_RECEIVE, src: 'tempImageSrc' } )
		);
	} );
} );

describe( '#announceFailure()', () => {
	test( 'should dispatch an error notice', () => {
		const result = announceFailure();

		expect( result.type ).to.eql( GRAVATAR_UPLOAD_REQUEST_FAILURE );
	} );
} );
