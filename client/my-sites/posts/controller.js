/**
 * External dependencies
 */

import page from 'page';
import React from 'react';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:my-sites:posts' );

/**
 * Internal Dependencies
 */
import areAllSitesSingleUser from 'calypso/state/selectors/are-all-sites-single-user';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isJetpackSite, isSingleUserSite } from 'calypso/state/sites/selectors';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import Posts from 'calypso/my-sites/posts/main';

export default {
	posts: function ( context, next ) {
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );
		const author = context.params.author === 'my' ? getCurrentUserId( state ) : null;
		let search = context.query.s || '';
		const category = context.query.category;
		const tag = context.query.tag;

		function shouldRedirectMyPosts() {
			if ( ! author ) {
				return false;
			}
			if ( areAllSitesSingleUser( state ) ) {
				return true;
			}
			if ( isSingleUserSite( state, siteId ) || isJetpackSite( state, siteId ) ) {
				return true;
			}
		}

		debug( 'author: `%s`', author );

		// Disable search in all-sites mode because it doesn't work.
		if ( ! siteId ) {
			search = '';
		}

		debug( 'search: `%s`', search );

		if ( shouldRedirectMyPosts() ) {
			page.redirect( context.path.replace( /\/my\b/, '' ) );
			return;
		}

		context.primary = React.createElement( Posts, {
			context,
			author,
			statusSlug: context.params.status,
			search,
			category,
			tag,
		} );
		next();
	},
};
