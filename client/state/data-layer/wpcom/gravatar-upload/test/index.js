import {
	GRAVATAR_UPLOAD_RECEIVE,
	GRAVATAR_UPLOAD_REQUEST_SUCCESS,
	GRAVATAR_UPLOAD_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { uploadGravatar, announceSuccess, announceFailure } from '../';

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
	const noop = () => {};
	const tempImageSrc = 'tempImageSrc';

	beforeAll( () => {
		global.FileReader = jest.fn( () => ( {
			readAsDataURL: noop,
			addEventListener: function ( event, callback ) {
				this.result = tempImageSrc;
				callback();
			},
		} ) );
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

		expect( result[ 0 ].type ).toEqual( GRAVATAR_UPLOAD_REQUEST_FAILURE );
	} );
} );
