/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:stats-data-summary-list' );

/**
 * Internal dependencies
 */
var Model = require( '../summary' );

/**
 * StatsDataSummaryList component
 * This component acts as a collection of StatsDataSummary objects
 * @api public
 */
function StatsDataSummaryList( options ) {
	var requiredStrings = [ 'period' ];
	debug('New StatsDataSummary Loading with options ', options );

	if ( ! ( this instanceof StatsDataSummaryList ) ) {
		return new StatsDataSummaryList( options );
	}

	// Validate a proper config was passed in
	if ( 'object' !== typeof options ) {
		throw new TypeError( 'a config `object` must be passed in' );
	}

	if ( 'object' !== typeof options.sites ) {
		throw new TypeError( 'a options.sites array must be passed in' );
	}

	requiredStrings.forEach( function( attr ) {
		if ( 'string' !== typeof options[ attr ] ) {
			throw new TypeError('a `options.' + attr + '` must be passed in');
		}
	} );

	this.sites = options.sites;
	this.period = options.period;
	this.records = {};
	this.sites.forEach( function( site ) {
		this.records[ site.ID ] = new Model( { siteId: site.ID, period: this.period, date: site.date } );
	}.bind( this ) );
}


/**
 * update the period on this collection
 * triggers a search of local store on records and/or a fetch to grab new data
 *
 * @api public
 * options{ date: 'YYYY-MM-DD', period: 'years/months/weeks/days' }
 */
StatsDataSummaryList.prototype.updatePeriod = function( options ) {
	this.date = options.date;
	this.period = options.period;

	this.siteIds.forEach( function( siteId ) {
		this.records[ siteId ].fetchPeriod( { period: this.period, date: this.date } );
	}.bind( this ) );
	
	return true;
};

/**
 * Get the corresponding model object from the collection
 *
 * @api public
 * arg siteId
 */
StatsDataSummaryList.prototype.get = function( siteId, date ) {
	if ( ! this.records[ siteId ] ) {
		this.records[ siteId ] = new Model( { siteId: siteId, period: this.period, date: date } );
	}
	return this.records[ siteId ];
};

StatsDataSummaryList.prototype.lastUpdate = function() {
	var time = new Date().getTime(),
		allUpdates;

	allUpdates = this.siteIds.map( function( siteId ) {
		var record = this.records[ siteId ];
		if ( record.data && record.data.updatedAt ) {
			return record.data.updatedAt;
		} else {
			return time;
		}
	}.bind( this ) ).sort();
	return allUpdates.pop();
};

/**
 * Expose `StatsDataSummaryList`
 */
module.exports = StatsDataSummaryList;
