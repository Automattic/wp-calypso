/**
 * External dependencies
 */

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

describe( '#uploadGravatar()', () => {
	test( 'dispatches an HTTP request to the gravatar upload endpoint', () => {
		const action = {
			type: 'DUMMY_ACTION',
			file: 'file',
			email: 'email',
		};

		const result = uploadGravatar( action );

		expect( result ).toEqual(
			http(
				{
					apiNamespace: 'wpcom/v2',
					method: 'POST',
					body: {},
					path: '/gravatar-upload',
					formData: [
						[ 'account', 'email' ],
						[ 'filedata', 'file' ],
					],
				},
				action
			)
		);
	} );
} );

describe( '#announceSuccess()', () => {
	let oFormData, oFileReader;
	const noop = () => {};
	const tempImageSrc = 'tempImageSrc';

	beforeAll( () => {
		oFormData = global.FormData;
		oFileReader = global.FileReader;
		global.FormData = jest.fn( () => ( {
			append: noop,
		} ) );
		global.FileReader = jest.fn( () => ( {
			readAsDataURL: noop,
			addEventListener: function ( event, callback ) {
				this.result = tempImageSrc;
				callback();
			},
		} ) );
	} );
	afterAll( () => {
		global.FormData = oFormData;
		global.FileReader = oFileReader;
	} );

	test( 'dispatches a success action when the file is read', () => {
		const action = {
			type: 'DUMMY_ACTION',
			file: 'file',
			email: 'email',
		};
		const dispatch = jest.fn();

		announceSuccess( action, noop, { success: true } )( dispatch );
		expect( dispatch ).toHaveBeenCalledWith(
			expect.objectContaining( { type: GRAVATAR_UPLOAD_REQUEST_SUCCESS } )
		);
	} );

	test( 'dispatches a upload received action with the image data when the file is read', () => {
		const action = {
			type: 'DUMMY_ACTION',
			file: 'file',
			email: 'email',
		};
		const dispatch = jest.fn();

		announceSuccess( action, noop, { success: true } )( dispatch );
		expect( dispatch ).toHaveBeenCalledWith( {
			type: GRAVATAR_UPLOAD_RECEIVE,
			src: 'tempImageSrc',
		} );
	} );
} );

describe( '#announceFailure()', () => {
	test( 'should dispatch an error notice', () => {
		const result = announceFailure();

		expect( result.type ).toEqual( GRAVATAR_UPLOAD_REQUEST_FAILURE );
	} );
} );
