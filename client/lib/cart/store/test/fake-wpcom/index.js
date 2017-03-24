var toArray = require( 'lodash/toArray' );

function FakeWPCOM() {
	if ( ! ( this instanceof FakeWPCOM ) ) {
		return new FakeWPCOM();
	}

	this._requests = [];
}

FakeWPCOM.prototype.cart = function() {
	var arrayArguments = toArray( arguments ),
		method = arrayArguments[ 1 ];

	if ( method === 'POST' ) {
		this._requests.push( {
			isResolved: false,
			method: method,
			cart: arrayArguments[ 2 ],
			callback: arrayArguments[ 3 ]
		} );
	} else {
		this._requests.push( {
			isResolved: false,
			method: method,
			callback: arrayArguments[ 2 ]
		} );
	}
};

FakeWPCOM.prototype.resolveRequest = function( index, responseData ) {
	var request = this._requests[ index ];

	if ( request.isResolved ) {
		throw new Error( 'Request was already resolved' );
	}

	request.callback( null, responseData );
	request.isResolved = false;
};

FakeWPCOM.prototype.getRequest = function( index ) {
	if ( ! this._requests[ index ] ) {
		throw new Error( 'Request at index ' + index + ' was never started' );
	}

	return this._requests[ index ];
};

module.exports = FakeWPCOM;
