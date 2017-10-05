/**
 * External dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory('calypso:stats-data:local-list');
import store from 'store';
import { find } from 'lodash';

/**
 * Internal dependencies
 */

/**
 * StatsDataLocalList component
 *
 * @api public
 */
function StatsDataLocalList( options ) {
	if ( ! ( this instanceof StatsDataLocalList ) ) {
		return new StatsDataLocalList( options );
	}

	if ( 'string' !== typeof options.localStoreKey ) {
		throw new TypeError( 'a options.localStoreKey must be passed in' );
	}

	debug( 'creating new local list' );
	this.localStoreKey = options.localStoreKey;
	this.limit = options.limit || 10;
	return this;
}


/**
 * Get the data from localStorage
 *
 * @return [Array]
 * @api public
 */
StatsDataLocalList.prototype.getData = function() {
	var localStoreData = store.get( this.localStoreKey ) || [];
	return localStoreData;
};

/**
 * Empty all data from localStorage for this localStoreKey
 *
 * @return true
 * @api public
 */
StatsDataLocalList.prototype.clear = function() {
	store.set( this.localStoreKey, [] );
	return true;
};

/**
 * Stores 'value' for the 'key' in localStorage
 *
 * @param key String
 * @param value
 * @return { Record } object
 * @api public
 */
StatsDataLocalList.prototype.set = function( key, value ) {
	var record = { key: key, createdAt: new Date().getTime(), data: value },
		localData = this.getData(),
		newLocalData;

	debug( 'storing data locally ' + key, value );
	newLocalData = localData.filter( function( cachedRecord ) {
		return cachedRecord && ( cachedRecord.key !== key );
	} );

	newLocalData.push( record );

	// Limit the number of records
	if ( newLocalData.length > this.limit ) {
		newLocalData = newLocalData.slice( newLocalData.length - this.limit );
	}

	store.set( this.localStoreKey, newLocalData );
	return record;
};


/**
 * Finds 'value' for the 'key' in localStorage
 *
 * @param key String
 * @return { Record } object || false if not found
 * @api public
 */
StatsDataLocalList.prototype.find = function( key ) {
	return find( this.getData(), { key } ) || false;
};

/**
 * Expose `StatsDataLocalList`
 */
module.exports = StatsDataLocalList;
