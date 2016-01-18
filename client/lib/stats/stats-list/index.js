/**
 * External dependencies
 */
var Emitter = require( 'lib/mixins/emitter'),
	debug = require( 'debug' )( 'calypso:stats-list' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	LocalList = require( 'lib/local-list' ),
	statsParser = require( './stats-parser' )(),
	analytics = require( 'analytics' );
import { fetchSiteStats } from 'state/stats/actions';

var responseHandler,
	buildExportArray,
	trackExtraStats = false,
	documentedEndpoints = [ 'statsVideo', 'statsPublicize', 'statsStreak', 'statsFollowers', 'statsCommentFollowers', 'statsTopAuthors', 'statsTags', 'statsComments', 'statsPostViews', 'statsVideoPlays','stats', 'statsVisits', 'statsReferrers', 'statsTopPosts', 'statsClicks', 'statsCountryViews', 'statsSearchTerms' ],
	undocumentedEndpoints = [ 'statsEvents', 'statsInsights' ];

responseHandler = function() {
	return function( error, data ) {
		// By default we set the data to that returned by the api response
		var parsedData = data,
			timeSpent,
			timeGroup;
		debug( 'new payload', data );

		if ( error ) {
			if ( this.performRetry ) {
				this.performRetry = false;
				if ( trackExtraStats ) {
					analytics.mc.bumpStat( 'calypso_stats_retries', this.statType );
				}
				this.fetch();
			} else {
				debug( 'encountered an api error', error );
				this.error = error;
				this.loading = false;
				this.emit( 'change' );
				analytics.mc.bumpStat( 'calypso_stats_errors', this.statType );
			}
			return;
		}

		if ( this.startedAt && trackExtraStats ) {
			timeSpent = Date.now() - this.startedAt;

			if ( timeSpent < 1000 ) {
				timeGroup = '0-1';
			} else if ( timeSpent < 2000 ) {
				timeGroup = '1-2';
			} else if ( timeSpent < 3000 ) {
				timeGroup = '2-3';
			} else if ( timeSpent < 6000 ) {
				timeGroup = '3-6';
			} else if ( timeSpent < 9000 ) {
				timeGroup = '6-9';
			} else {
				timeGroup = '9plus';
			}

			analytics.mc.bumpStat( 'calypso_stats_' + this.statType.replace( /^stats/, '' ), timeGroup );
		}

		// List is no longer loading, toggle _loading
		this.loading = false;

		// if we have a parser, run the data through it
		if( 'function' === typeof statsParser[ this.statType ] ) {
			parsedData = statsParser[ this.statType ].call( this, data );
		}

		// track empty payloads in mc
		if ( this.isEmpty() && trackExtraStats ) {
			analytics.mc.bumpStat( 'calypso_stats_empty', this.statType.replace( /^stats/, '' ) );
		}

		// cache data in local store
		this.local.set( this.localKey, parsedData );
		this.response = parsedData;
		debug( 'updated data', this );
		this.emit( 'change' );
	};
};

buildExportArray = function( data, parent ) {
	var exportData = [],
		label = parent ? ( parent + ' > ' + data.label ) : data.label,
		escapedLabel;

	escapedLabel = label.replace( /\"/ , '""' );

	exportData.push( [ '"' + escapedLabel + '"', data.value ] );

	if ( data.children ) {
		var childData = data.children.map( function( child ) {
			return buildExportArray( child, label );
		} );

		childData = childData.concat.apply( [], childData );

		exportData = exportData.concat( childData );
	}

	return exportData;
};

/**
 * StatsList component
 *
 * @api public
 */
function StatsList( options ) {
	if ( ! ( this instanceof StatsList ) ) {
		return new StatsList( options );
	}

	if ( 'number' !== typeof options.siteID ) {
		throw new TypeError( 'options.siteID must be a number' );
	}

	if ( undocumentedEndpoints.indexOf( options.statType ) === -1 &&
		documentedEndpoints.indexOf( options.statType ) === -1
	) {
		throw new TypeError( 'options.statType must be one of the following: ' + undocumentedEndpoints.concat( documentedEndpoints ).join( ', ' ) );
	}

	[ 'siteID', 'statType' ].forEach( function( attr ) {
		this[ attr ] = options[ attr ];
		delete options[ attr ];
	}, this );

	this.options = options;
	this.response = {
		data: []
	};

	this.error = null;
	this.loading = true;
	this.performRetry = true;
	this.startedAt = null;
	this.isDocumentedEndpoint = ( documentedEndpoints.indexOf( this.statType ) >= 0 );

	this.localStoreKey = this.statType + this.siteID;

	// For LocalList
	this.local = new LocalList( { localStoreKey: this.localStoreKey } );
	this.localKey = Object.keys( this.options ).map( function( key ) { return this.options[ key ]; }, this ).join( ':' );

	// check for a local cache
	var localData = this.local.find( this.localKey );
	if ( localData && ! Array.isArray( localData ) ){
		debug( 'local cached found', localData.data );
		this.loading = false;
		this.response = localData.data;
	}

	this.fetch();

	return this;
}

/**
 * Fetch calls undocumnted api method for statType
 *
 * @api public
 *
 */
StatsList.prototype.fetch = function() {
	const {
		options,
		siteID,
		statType
	} = this;

	// @TODO handle this in actions file
	this.startedAt = Date.now();

	fetchSiteStats( {
		siteID,
		statType,
		options,
	} );

// @TODO tie in responseHandler
//	wpcomSite[ this.statType ].call( wpcomSite, options, responseHandler( this.options ).bind( this ) );
};


/**
 * Is the StatsList still loading data?
 *
 * @api public
 *
 */
StatsList.prototype.isLoading = function() {
	return this.loading || 0 === this.siteID;
};


/**
 * Was there an error loading the StatsList data?
 *
 * @api public
 *
 */
StatsList.prototype.isError = function() {
	return !! ( this.error ) && ( 0 !== this.siteID );
};

/**
 *
 * Is the list empty
 * @api public
 *
 */
StatsList.prototype.isEmpty = function( dataAttribute ) {
	if ( this.response.data instanceof Array ) {
		return ! this.isLoading() && this.response.data.length === 0;
	} else if ( dataAttribute && this.response.data && this.response.data[ dataAttribute ] ){
		return ! this.isLoading() && this.response.data[ dataAttribute ].length === 0;
	}
};

StatsList.prototype.csvData = function() {
	var csvData = [],
		data = this.response.data.map( function( item ) { return buildExportArray( item ); } );

	return csvData.concat.apply( [], data );
};

/**
 * Mixins
 */
Emitter( StatsList.prototype );

module.exports = StatsList;
