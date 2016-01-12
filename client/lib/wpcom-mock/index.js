/**
 * External dependencies
 */
var WpcomVCR = require( './wpcom-vcr' ),
	wpcom = require( 'lib/wp' ),
	sinon = require( 'sinon' ),
	qs = require( 'qs' );

function fakeXHR( request ) {
	var response = request.response,
		fakeXMLHttpRequest = new sinon.FakeXMLHttpRequest();

	fakeXMLHttpRequest.params = request.params;
	fakeXMLHttpRequest.readyState = sinon.FakeXMLHttpRequest.OPENED;
	if ( response ) {
		fakeXMLHttpRequest.respond( 200, response._headers, JSON.stringify( response ) );
	} else {
		fakeXMLHttpRequest.respond( 404 );
	}
	return fakeXMLHttpRequest;
}

function WpcomMock( options ) {
	var self = this;
	if ( !( this instanceof WpcomMock ) ) {
		return new WpcomMock( options );
	}
	options = options || {};
	this.sinon = options.sinonSandbox || sinon;
	this.vcr = new WpcomVCR( options.recordingsDir );
	this.mockingAPICall = false;
	this.mock = function() {
		self.mockingAPICall = true;
		return wpcom;
	};
	this.requestStub = this.sinon.stub( wpcom, 'request', function( params, mockResponseCb ) {
		var request;
		// if we are registering a new mock request using the WPCOM API format:
		// eg: this.mock().site( SITE_ID ).usersList( fetchOptions, function( mockResponseCb ) { })
		if ( self.mockingAPICall ) {
			self.mockingAPICall = false;
			mockResponseCb( function( err, response ) {
				self.mockRequest( {
					params: params,
					response: response,
					error: err
				} );
			} );
		} else { // otherwise we just mock the request
			request = self.vcr.matchRequest( params );
			// WARN: mockResponseCb is called synchronously, before we even return the fake XHR object
			// This is easier for tests so we don't have to play with fake timers
			// but it can be tricky if your are expecting for the xhr object to be available at this point
			if ( !request || !request.response ) {
				mockResponseCb( new Error( request && request.error || 'Not Found' ) );
			} else {
				mockResponseCb( null, request.response, request );
			}
			return fakeXHR( request );
		}
	} );
	this.mockRequest = this.vcr.addEntry.bind( this.vcr );
	this.mockWith = this.vcr.useCassette.bind( this.vcr );
	this.unMock = this.requestStub.restore.bind( this.requestStub );
}

module.exports = WpcomMock;
module.exports.create = WpcomMock;

module.exports.utils = {
	queryString: function( query ) {
		return qs.stringify( query, { arrayFormat: 'brackets' } );
	}
};
