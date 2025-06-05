import page from '@automattic/calypso-router';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { setBackPath } from 'calypso/state/themes/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getProps, loggedOut } from './controller';
import SingleSiteComponent from './single-site';
import Upload from './theme-upload';

// Renders the SingleSiteComponent
export function loggedIn( context, next ) {
	// Block direct access for P2 sites
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	if ( isSiteWPForTeams( state, siteId ) ) {
		return page.redirect( `/home/${ context.params.site_id }` );
	}

	// Scroll to the top
	if ( typeof window !== 'undefined' && context.init ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = <SingleSiteComponent { ...getProps( context ) } />;

	next();
}

export function upload( context, next ) {
	// Store previous path to return to only if it was main showcase page
	if (
		context.previousPath &&
		context.previousPath.startsWith( '/themes' ) &&
		! context.previousPath.startsWith( '/themes/upload' )
	) {
		context.store.dispatch( setBackPath( context.previousPath ) );
	}

	const noticeType = context.query.notice;

	context.primary = <Upload noticeType={ noticeType } />;
	next();
}

export function renderThemes( context, next ) {
	const state = context.store.getState();
	if ( isUserLoggedIn( state ) ) {
		return loggedIn( context, next );
	}

	return loggedOut( context, next );
}
