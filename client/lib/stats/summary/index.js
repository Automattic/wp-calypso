/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:stats-data-summary' ),
	store = require( 'store' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	Emitter = require( 'lib/mixins/emitter' );


/**
 * StatsDataSummaryModel component
 *
 * @api public
 */
function StatsDataSummary( options ) {
	var localData;

	if ( ! ( this instanceof StatsDataSummary ) ) {
		return new StatsDataSummary( options );
	}
	this.period = options.period;
	this.date = options.date;
	this.siteId = options.siteId;
	this.data = {};
	this.localStoreKey = 'StatsDataSummary' + options.siteId;

	localData = this.findInLocalStorage();

	if ( ! localData ) {
		this.fetch();
	}
	return this;
}

/**
 * Mixins
 */
Emitter( StatsDataSummary.prototype );


/**
 *	To save on http requests, only fetch new data if record doesn't exist, or if it is 10 or more minutes old
 *  Eventually we should do some polling to refresh this periodically
 *
 */
function fetchNewRecord( record ) {
	var performFetch = false,
		requestedAt = new Date().getTime();

	if ( ! record.updatedAt ) {
		performFetch = true;
	} else if ( requestedAt - record.updatedAt >= 600000 ) {
		performFetch = true;
	}

	return performFetch;
}

/**
 * Fetch calls undocumnted api method for stats/summary
 *
 * @api public
 *
 */
StatsDataSummary.prototype.fetch = function( callback ) {
	var query = {
		period: this.period,
		date: this.date
	};
	
	wpcom.site( this.siteId ).statsSummary( query, function( error, data ) {
		// Remove the header response from API, and add in a localized timestamp
		delete data.headers;
		data.updatedAt = new Date().getTime();

		this.data = data;
		this.saveToLocalStorage();

		if( this.period === data.period && this.date === data.date ) {
			this.emit( 'change' );
		}

		if ( 'function' === typeof callback ) {
			callback( error, data );
		}

	}.bind( this ) );
};

/*	fetchPeriod
 *	options { date: 'YYYY-MM-DD', period: 'weeks' }
 *	attempts to find valid record in local storage and sets to .data if found
 *  otherewise calls fetch()
 */

StatsDataSummary.prototype.fetchPeriod = function( options ) {
	debug( "Fetching a new period ", options );
	var localData;

	this.period = options.period;
	this.date = options.date;

	localData = this.findInLocalStorage();

	if ( ! localData ) {
		this.fetch();
	} else {
		this.data = localData;
		this.emit( 'change' );
	}
};


/* findInLocalStorage
 * Attempts to find a record matching the date/period in localStorage
 * returns record or false
 */
StatsDataSummary.prototype.findInLocalStorage = function() {
	var localStoreData = store.get( this.localStoreKey ) || [],
		matchedRecord;
	debug( 'looking up in local storage ' + this.period + ' date ' + this.date, localStoreData );
	matchedRecord = localStoreData.filter( function( cachedRecord ) {
		return cachedRecord && cachedRecord.date === this.date && cachedRecord.period === this.period;
	}.bind( this ) );

	// If we have a matched record return it && the record is older than 10 minutes, grab a new copy too
	if ( matchedRecord.length > 0  ) {
		this.data = matchedRecord[ 0 ];

		if( fetchNewRecord( this.data ) ) {
			this.fetch();
		}
		return matchedRecord[ 0 ];
	} else {
		return false;
	}
};


/* Persists the existing data to local storage
 * Ensures only one date/period combination exists
 * Ensures only 10 entries exist for this site in local storage to clear bloat
 */
StatsDataSummary.prototype.saveToLocalStorage = function() {
	var localStoreData = store.get( this.localStoreKey ) || [],
		newCachedData;

	// first remove matching cached record
	newCachedData = localStoreData.filter( function( cachedRecord ) {
		return cachedRecord && cachedRecord.date !== this.data.date && cachedRecord.period !== this.data.period;
	}.bind( this ) );

	newCachedData.push( this.data );

	// In order to prevent too much data in the local store, only allow 10 records per site key
	if ( newCachedData.length > 10 ) {
		newCachedData = newCachedData.slice( newCachedData.length - 10 );
	}

	store.set( this.localStoreKey, newCachedData );
};


/**
 * Expose `StatsDataSummaryModel`
 */
module.exports = StatsDataSummary;
