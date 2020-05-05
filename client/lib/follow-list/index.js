/**
 * External dependencies
 */

import { find } from 'lodash';

/**
 * Internal dependencies
 */
import FollowListSite from './site.js';

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
FollowList.prototype.add = function ( object ) {
	let site = this.siteExists( object.site_id );
	if ( ! site ) {
		site = new FollowListSite( object );
		this.data.push( site );
	}
	return site;
};

FollowList.prototype.siteExists = function ( site_id ) {
	return find( this.data, { site_id } ) || false;
};

export default FollowList;
