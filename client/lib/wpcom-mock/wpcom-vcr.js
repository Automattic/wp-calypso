/**
 * External dependencies
 */
var path = require( 'path' ),
	_ = require( 'lodash' ),
	hash = require( 'object-hash' ),
	jsonStoreFS = require( 'json-store-fs' );

function getRequestId( params ) {
	return params.method + ' ' + params.path + ( params.query ? '?' + params.query : '' );
}

function cleanFormData( formData ) {
	var key;
	if ( formData ) {
		delete formData.submittingForm;
		for ( key in formData ) {
			if ( key.indexOf( 'recordEventOnce-' ) === 0 ) {
				delete formData[ key ];
			}
		}
	}
}

function hashFormData( formData ) {
	cleanFormData( formData );
	return hash( formData || '' );
}

module.exports = WpcomVCR;

function WpcomVCR( libraryDir ) {
	this.libraryDir = libraryDir || '.';
	this.recording = {};
}

WpcomVCR.prototype.useCassette = function( cassettePath ) {
	var cassetteFullPath = path.join( this.libraryDir, cassettePath );
	var cassetteName = path.basename( cassetteFullPath, '.json' );
	var cassetteDir = path.dirname( cassetteFullPath );
	var recordRequestsMap = jsonStoreFS( cassetteDir ).sync.get( cassetteName );
	this.recording = _.merge( this.recording, recordRequestsMap || {} );
	this.indexPOSTRequests();
};

WpcomVCR.prototype.indexPOSTRequests = function() {
	var requestId,
		requestData;

	for ( requestId in this.recording ) {
		requestData = this.recording[ requestId ];
		if ( Array.isArray( requestData ) ) {
			this.recording[ requestId ] = _.reduce( requestData, function( result, request ) {
				result[ hashFormData( request.params.formData ) ] = request;
				return result;
			}, {} );
		}
	}
};

WpcomVCR.prototype.reset = function() {
	this.recording = {};
};

WpcomVCR.prototype.addEntry = function( entry ) {
	var requestId,
		params = entry.params;

	requestId = getRequestId( params );

	if ( 'GET' !== params.method ) {
		if ( ! this.recording[ requestId ] ) {
			this.recording[ requestId ] = {};
		}
		this.recording[ requestId ][ hashFormData( params.formData ) ] = entry;
	} else {
		this.recording[ requestId ] = entry;
	}
};

WpcomVCR.prototype.matchRequest = function( params ) {
	var requestId,
		entry;

	requestId = getRequestId( params );

	if ( 'GET' !== params.method ) {
		entry = this.recording[ requestId ][ hashFormData( params.formData ) ];
	} else {
		entry = this.recording[ requestId ];
	}

	return entry;
};
