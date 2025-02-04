import page from '@automattic/calypso-router';
import debugFactory from 'debug';
import { createElement } from 'react';
import Posts from 'calypso/my-sites/posts/main';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import areAllSitesSingleUser from 'calypso/state/selectors/are-all-sites-single-user';
import { isJetpackSite, isSingleUserSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const debug = debugFactory( 'calypso:my-sites:posts' );

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

		context.primary = createElement( Posts, {
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
