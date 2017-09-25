/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon, { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { uploadGravatar, announceSuccess, announceFailure } from '../';
import { GRAVATAR_UPLOAD_RECEIVE, GRAVATAR_UPLOAD_REQUEST_SUCCESS, GRAVATAR_UPLOAD_REQUEST_FAILURE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { useSandbox } from 'test/helpers/use-sinon';

describe( '#uploadGravatar()', () => {
	it( 'dispatches an HTTP request to the gravatar upload endpoint', () => {
		const action = {
			type: 'DUMMY_ACTION',
			file: 'file',
			email: 'email',
		};
		const dispatch = spy();

		uploadGravatar( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( http( {
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			body: {},
			path: '/gravatar-upload',
			formData: [
				[ 'account', 'email' ],
				[ 'filedata', 'file' ],
			],
		}, action ) );
	} );
} );

describe( '#announceSuccess()', () => {
	let sandbox;
	const noop = () => {};

	const tempImageSrc = 'tempImageSrc';
	useSandbox( newSandbox => {
		sandbox = newSandbox;
		global.FormData = sandbox.stub().returns( {
			append: noop
		} );
		global.FileReader = sandbox.stub().returns( {
			readAsDataURL: noop,
			addEventListener: function( event, callback ) {
				this.result = tempImageSrc;
				callback();
			}
		} );
	} );

	it( 'dispatches a success action when the file is read', () => {
		const action = {
			type: 'DUMMY_ACTION',
			file: 'file',
			email: 'email',
		};
		const dispatch = spy();

		announceSuccess( { dispatch }, action, noop, { success: true } );
		expect( dispatch ).to.have.been.calledWith( sinon.match( { type: GRAVATAR_UPLOAD_REQUEST_SUCCESS } ) );
	} );

	it( 'dispatches a upload received action with the image data when the file is read', () => {
		const action = {
			type: 'DUMMY_ACTION',
			file: 'file',
			email: 'email',
		};
		const dispatch = spy();

		announceSuccess( { dispatch }, action, noop, { success: true } );
		expect( dispatch ).to.have.been.calledWith( sinon.match( { type: GRAVATAR_UPLOAD_RECEIVE, src: 'tempImageSrc' } ) );
	} );
} );

describe( '#announceFailure()', () => {
	it( 'should dispatch an error notice', () => {
		const dispatch = spy();

		announceFailure( { dispatch } );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( sinon.match( { type: GRAVATAR_UPLOAD_REQUEST_FAILURE } ) );
	} );
} );
