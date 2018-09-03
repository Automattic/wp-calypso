/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	fetchShippingClasses,
	fetchShippingClassesSuccess,
	fetchShippingClassesFailure,
	updateShippingClass,
	updateShippingClassSuccess,
	updateShippingClassFailure,
	createShippingClass,
	createShippingClassSuccess,
	createShippingClassFailure,
	deleteShippingClass,
	deleteShippingClassSuccess,
	deleteShippingClassFailure,
} from 'woocommerce/state/sites/shipping-classes/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	shippingClassesRequest,
	shippingClassUpdate,
	shippingClassCreate,
	shippingClassDelete,
} from '../';

const siteId = 123;
const classId = 123;
const temporaryId = 'temp-123';
const changes = { name: 'Class A' };
const dispatchFn = action => action;
const trapDispatch = action => {
	let result;

	action( actionResult => {
		result = actionResult;
	} );

	return result;
};
const getState = () => ( {
	extensions: {
		woocommerce: {
			sites: {
				[ siteId ]: {
					shippingClasses: false,
				},
			},
		},
	},
} );

describe( 'shippingClassesRequest', () => {
	const { fetch, onSuccess, onError } = shippingClassesRequest;

	describe( '#fetch', () => {
		test( 'should dispatch a get action for the shipping classes', () => {
			const action = fetchShippingClasses( siteId )( dispatchFn, getState );
			const result = fetch( action );

			expect( result ).to.eql(
				http(
					{
						method: 'GET',
						path: `/jetpack-blogs/${ siteId }/rest-api/`,
						apiVersion: '1.1',
						body: null,
						query: {
							json: true,
							path: '/wc/v3/products/shipping_classes&_method=GET',
							apiVersion: '1.1',
						},
					},
					action
				)
			);
		} );
	} );

	describe( '#onSuccess', () => {
		test( 'should dispatch a shipping classes success action', () => {
			const data = [ { dummyProp: true } ];
			const action = { siteId };
			const response = { data };

			const result = onSuccess( action, response )( dispatchFn );

			expect( result ).to.eql( fetchShippingClassesSuccess( siteId, data ) );
		} );
	} );

	describe( '#onError', () => {
		test( 'should dispatch a notification', () => {
			const action = { siteId };
			const error = {};

			const result = onError( {}, {} )( dispatchFn );
			const expected = fetchShippingClassesFailure( action, error, dispatchFn );

			// Remove callbacks to prevent different instances of
			// the same function from failing tests.
			delete result.notice.onClick;
			delete expected.notice.onClick;

			expect( result ).to.eql( expected );
		} );
	} );
} );

describe( 'shippingClassUpdate', () => {
	const { fetch, onSuccess, onError } = shippingClassUpdate;

	describe( '#fetch', () => {
		test( 'should dispatch a put action for the shipping class', () => {
			const action = updateShippingClass( siteId, classId, changes );
			const result = fetch( action );

			const expected = http(
				{
					method: 'POST',
					path: `/jetpack-blogs/${ siteId }/rest-api/`,
					apiVersion: '1.1',
					body: {
						path: `/wc/v3/products/shipping_classes/${ siteId }&_method=PUT`,
						body: JSON.stringify( changes ),
						json: true,
					},
					query: {
						json: true,
						apiVersion: '1.1',
					},
				},
				action
			);

			expect( result ).to.eql( expected );
		} );
	} );

	describe( '#onSuccess', () => {
		test( 'should dispatch a successful shipping class update action', () => {
			let successCallbackCalled = false;
			const successCallback = () => {
				successCallbackCalled = true;
			};

			const action = {
				siteId,
				successCallback,
			};

			const data = { dummy: true };
			const response = { data };

			const result = trapDispatch( onSuccess( action, response ) );
			const expected = updateShippingClassSuccess( siteId, data );

			expect( result ).to.eql( expected );
			expect( successCallbackCalled ).to.eql( true );
		} );
	} );

	describe( '#onError', () => {
		test( 'should dispatch a notification', () => {
			const action = { siteId };
			const error = {};

			const result = onError( {}, {} )( dispatchFn );
			const expected = updateShippingClassFailure( action, error, dispatchFn );

			// Remove the randomness caused by errorNotice
			result.notice.noticeId = expected.notice.noticeId;

			expect( result ).to.eql( expected );
		} );
	} );
} );

describe( 'shippingClassCreate', () => {
	const { fetch, onSuccess, onError } = shippingClassCreate;

	describe( '#fetch', () => {
		test( 'should dispatch a post action for the shipping class', () => {
			const action = createShippingClass( siteId, temporaryId, changes );
			const result = fetch( action );

			const expected = http(
				{
					method: 'POST',
					path: `/jetpack-blogs/${ siteId }/rest-api/`,
					apiVersion: '1.1',
					body: {
						path: `/wc/v3/products/shipping_classes/&_method=POST`,
						body: JSON.stringify( changes ),
						json: true,
					},
					query: {
						json: true,
						apiVersion: '1.1',
					},
				},
				action
			);

			expect( result ).to.eql( expected );
		} );
	} );

	describe( '#onSuccess', () => {
		test( 'should dispatch a successful shipping class create action', () => {
			let successCallbackCalled = false;
			const successCallback = () => {
				successCallbackCalled = true;
			};

			const action = {
				siteId,
				successCallback,
			};

			const data = { dummy: true };
			const response = { data };

			const result = trapDispatch( onSuccess( action, response ) );
			const expected = createShippingClassSuccess( action, data );

			expect( result ).to.eql( expected );
			expect( successCallbackCalled ).to.eql( true );
		} );
	} );

	describe( '#onError', () => {
		test( 'should dispatch a notification', () => {
			const action = { siteId };
			const error = {};

			const result = onError( {}, {} )( dispatchFn );
			const expected = createShippingClassFailure( action, error, dispatchFn );

			// Remove the randomness caused by errorNotice
			result.notice.noticeId = expected.notice.noticeId;

			expect( result ).to.eql( expected );
		} );
	} );
} );

describe( 'shippingClassDelete', () => {
	const { fetch, onSuccess, onError } = shippingClassDelete;

	describe( '#fetch', () => {
		test( 'should dispatch a delete action for the shipping class', () => {
			const action = deleteShippingClass( siteId, classId );
			const result = fetch( action );

			const expected = http(
				{
					method: 'POST',
					path: `/jetpack-blogs/${ siteId }/rest-api/`,
					apiVersion: '1.1',
					body: {
						path: `/wc/v3/products/shipping_classes/${ classId }&force=true&_method=DELETE`,
					},
					query: {
						json: true,
						apiVersion: '1.1',
					},
				},
				action
			);

			expect( result ).to.eql( expected );
		} );
	} );

	describe( '#onSuccess', () => {
		test( 'should dispatch a successful shipping class deletion action', () => {
			let successCallbackCalled = false;
			const successCallback = () => {
				successCallbackCalled = true;
			};

			const action = {
				siteId,
				classId,
				successCallback,
			};

			const result = trapDispatch( onSuccess( action ) );
			const expected = deleteShippingClassSuccess( siteId, classId );

			expect( result ).to.eql( expected );
			expect( successCallbackCalled ).to.eql( true );
		} );
	} );

	describe( '#onError', () => {
		test( 'should dispatch a notification', () => {
			const result = trapDispatch( onError( {}, {} ) );
			const expected = deleteShippingClassFailure();

			// Remove the randomness caused by errorNotice
			result.notice.noticeId = expected.notice.noticeId;

			expect( result ).to.eql( expected );
		} );
	} );
} );
