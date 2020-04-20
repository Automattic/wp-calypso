/**
 * External dependencies
 */

import { toArray } from 'lodash';

function FakeWPCOM() {
	if ( ! ( this instanceof FakeWPCOM ) ) {
		return new FakeWPCOM();
	}

	this._requests = [];
}

FakeWPCOM.prototype.getCart = function () {
	const arrayArguments = toArray( arguments );

	this._requests.push( {
		isResolved: false,
		method: 'GET',
		callback: arrayArguments[ 1 ],
	} );
};

FakeWPCOM.prototype.setCart = function () {
	const arrayArguments = toArray( arguments );

	this._requests.push( {
		isResolved: false,
		method: 'POST',
		cart: arrayArguments[ 1 ],
		callback: arrayArguments[ 2 ],
	} );
};

FakeWPCOM.prototype.resolveRequest = function ( index, responseData ) {
	const request = this._requests[ index ];

	if ( request.isResolved ) {
		throw new Error( 'Request was already resolved' );
	}

	request.callback( null, responseData );
	request.isResolved = false;
};

FakeWPCOM.prototype.getRequest = function ( index ) {
	if ( ! this._requests[ index ] ) {
		throw new Error( 'Request at index ' + index + ' was never started' );
	}

	return this._requests[ index ];
};

export default FakeWPCOM;
