/**
 * External dependencies
 */

import debugFactory from 'debug';

const debug = debugFactory( 'calypso:follow-list:site' );

/**
 * Internal dependencies
 */
import config from 'config';
import wpcom from 'lib/wp';
import Emitter from 'lib/mixins/emitter';

/**
 * FollowList component
 *
 * @api public
 */
function FollowListSite( args ) {
	if ( ! ( this instanceof FollowListSite ) ) {
		return new FollowListSite( args );
	}

	this.site_id = args.site_id;
	this.is_following = args.is_following;
	this.blog_domain = args.blog_domain;
}

/**
 * Mixins
 */
Emitter( FollowListSite.prototype );

/**
 *	if is_following is false, calls the follow endpoint
 */

FollowListSite.prototype.follow = function () {
	if ( ! this.is_following ) {
		debug( 'following site', this.site_id );
		this.is_following = true;
		this.emit( 'change' );
		wpcom
			.site( this.site_id )
			.follow()
			.add( { source: config( 'readerFollowingSource' ) }, function ( resp ) {
				debug( 'follow success', resp );
			} );
	}
};

/**
 *	if is_following is true, calls the delete action on follow
 */

FollowListSite.prototype.unfollow = function () {
	if ( this.is_following ) {
		this.is_following = false;
		this.emit( 'change' );
		wpcom
			.site( this.site_id )
			.follow()
			.del( { source: config( 'readerFollowingSource' ) }, function ( resp ) {
				debug( 'unfollow success', resp );
			} );
	}
};

export default FollowListSite;
