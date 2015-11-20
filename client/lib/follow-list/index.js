/**
 * Internal dependencies
 */
var FollowListSite = require( './site.js' );

/**
 * FollowList component
 *
 * @api public
 */
function FollowList() {
	if ( ! ( this instanceof FollowList ) ) {
		return new FollowList();
	}
	this.data = [];
}


/**
 * Adds a new follower object to the data store
 */
FollowList.prototype.add = function( object ) {
	var site = this.siteExists( object.site_id );
	if ( ! site ) {
		site = new FollowListSite( object );
		this.data.push( site );
	}
	return site;
};

FollowList.prototype.siteExists = function( site_id ) {
	var match = this.data.filter( function( followListSite ) {
		return followListSite.site_id === site_id;
	} );
	return match.length ? match[ 0 ] : false;
};

module.exports = FollowList;
