import Posts from 'calypso/my-sites/posts/main';
import areAllSitesSingleUser from 'calypso/state/selectors/are-all-sites-single-user';
import { isJetpackSite, isSingleUserSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function posts( context, next ) {
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

	if ( ! siteId ) {
		search = '';
	}

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
}
