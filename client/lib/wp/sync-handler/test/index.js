/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import mockery from 'mockery';

let wpcom, SyncHandler, generateKey, hasPaginationChanged, localData, responseData;

const localforageMock = {
	getLocalForage() {
		return {
			setItem: function( key, data ) {
				return new Promise( resolve => {
					localData[ key ] = data;
					resolve();
				} )
			},
			getItem: function( key ) {
				return new Promise( resolve => {
					resolve( localData[ key ] );
				} );
			},
		}
	}
};

const testRequestData = {
	simpleRequest: {
		method: 'GET',
		path: '/test'
	},
	postRequest: {
		method: 'GET',
		path: '/sites/example.wordpress.com/posts',
	},
}

const testResponseData = {
	postResponseWithNoHandle: {},
	postResponseWithHandle: {
		meta: {
			next_page: 'test'
		}
	},
	postResponseNewHandle: {
		meta: {
			next_page: 'test2'
		}
	}
}

describe( 'sync-handler', () => {
	before( () => {
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );
		mockery.registerMock( 'lib/localforage', localforageMock );
		const handlerMock = ( params, callback ) => {
			const key = generateKey( params );
			callback( null, responseData[ key ] );
			return responseData[ key ];
		};

		( { SyncHandler, generateKey, hasPaginationChanged } = require( '../' ) );
		wpcom = new SyncHandler( handlerMock );
	} );

	beforeEach( () => {
		responseData = {};
		localData = {};
	} );

	after( function() {
		mockery.disable();
	} );

	it( 'should call callback with local response', () => {
		const { postRequest } = testRequestData;
		const key = generateKey( postRequest );
		const callback = sinon.spy();
		localData[ key ] = { body: 'test' };
		wpcom( postRequest, callback );
		expect( callback.calledWith( null, 'test' ) );
	} );

	it( 'should call callback with request response', () => {
		const { postRequest } = testRequestData;
		const key = generateKey( postRequest );
		const callback = sinon.spy();
		responseData[ key ] = { body: 'test' };
		wpcom( postRequest, callback );
		expect( callback ).to.have.been.calledOnce;
		expect( callback.calledWith( null, 'test' ) );
	} );

	it( 'should call callback twice with local and request responses', () => {
		const { postRequest } = testRequestData;
		const key = generateKey( postRequest );
		const callback = sinon.spy();
		localData[ key ] = { body: 'test1' };
		responseData[ key ] = ( null, { body: 'test2' } );
		wpcom( postRequest, callback );
		expect( callback ).to.have.been.calledTwice;
		expect( callback.calledWith( null, 'test1' ) );
		expect( callback.calledWith( null, 'test2' ) );
	} );

	describe( 'generateKey', () => {
		it( 'should return the same key for identical request', () => {
			const { simpleRequest } = testRequestData;
			const secondRequest = Object.assign( {}, simpleRequest );
			const key1 = generateKey( simpleRequest );
			const key2 = generateKey( secondRequest );
			expect( typeof key1 ).to.equal( 'string' );
			expect( key1 ).to.equal( key2 );
		} );
		it( 'should return unique keys for different requests', () => {
			const { simpleRequest } = testRequestData;
			const secondRequest = Object.assign( { query: '?filter=test' }, simpleRequest );
			const key1 = generateKey( simpleRequest );
			const key2 = generateKey( secondRequest );
			expect( typeof key1 ).to.equal( 'string' );
			expect( key1 ).to.not.equal( key2 );
		} );
	} );

	describe( 'hasPaginationChanged', () => {
		before( () => {
			sinon.spy( hasPaginationChanged );
		} );
		it( 'should not call hasPaginationChanged for non-whitelisted requests', () => {
			const { simpleRequest } = testRequestData;
			wpcom( simpleRequest, () => {} );
			expect( hasPaginationChanged ).not.to.have.been.called;
		} );
		it( 'should call hasPaginationChanged once for whitelisted request', () => {
			const { postRequest } = testRequestData;
			wpcom( postRequest, () => {} );
			expect( hasPaginationChanged ).to.have.been.calledOnce;
		} );
		it( 'should return false if requestResponse has no page handle', () => {
			const { postResponseWithNoHandle } = testResponseData;
			const result = hasPaginationChanged( postResponseWithNoHandle, null );
			expect( result ).to.equal( false );
		} );
		it( 'should return false for call with identical response', () => {
			const { postResponseWithHandle } = testResponseData;
			const localResponse = Object.assign( {}, postResponseWithHandle );
			const result = hasPaginationChanged( postResponseWithHandle, localResponse );
			expect( result ).to.equal( false );
		} );
		it( 'should return true if page handle is different', () => {
			const { postResponseWithHandle, postResponseNewHandle } = testResponseData;
			const result = hasPaginationChanged( postResponseWithHandle, postResponseNewHandle );
			expect( result ).to.equal( true );
		} )
		it( 'should return true call with empty local response', () => {
			const { postResponseWithHandle } = testResponseData;
			const result = hasPaginationChanged( postResponseWithHandle, null );
			expect( result ).to.equal( true );
		} )
	} );
} );
