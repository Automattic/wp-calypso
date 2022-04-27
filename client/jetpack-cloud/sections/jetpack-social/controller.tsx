import { translate } from 'i18n-calypso';
import page from 'page';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { errorNotice } from 'calypso/state/notices/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ConnectionsPage from './connections';

export const connections: PageJS.Callback = ( context, next ) => {
	const { store } = context;
	const { dispatch } = store;
	const state = store.getState();
	const site = getSelectedSite( state );

	if ( site?.ID && ! canCurrentUser( state, site.ID, 'publish_posts' ) ) {
		dispatch(
			errorNotice(
				translate( 'You are not authorized to manage social media connections for this site.' )
			)
		);
	}

	context.primary = <ConnectionsPage />;
	next();
};

export const redirectIfNotJetpackCloud: PageJS.Callback = ( context, next ) => {
	const state = context.store.getState();
	const site = getSelectedSite( state );

	if ( ! isJetpackCloud() ) {
		return page.redirect( `/marketing/connections${ site?.slug ? '/' + site.slug : '' }` );
	}

	next();
};
