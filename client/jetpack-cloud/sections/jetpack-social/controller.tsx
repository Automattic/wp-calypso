import { translate } from 'i18n-calypso';
import page, { type Callback } from 'page';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { errorNotice } from 'calypso/state/notices/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import {
	isJetpackSite,
	isJetpackModuleActive,
	isJetpackConnectionPluginActive,
} from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ConnectionsPage from './connections';
import PromoPage from './promo';

export const connections: Callback = ( context, next ) => {
	const { store } = context;
	const { dispatch } = store;
	const state = store.getState();
	const site = getSelectedSite( state );
	const isJetpack = site?.ID && isJetpackSite( state, site.ID );
	const isPublicizeActive = site?.ID && isJetpackModuleActive( state, site.ID, 'publicize' );

	if ( site?.ID && ! canCurrentUser( state, site.ID, 'publish_posts' ) ) {
		dispatch(
			errorNotice(
				translate( 'You are not authorized to manage social media connections for this site.' )
			)
		);
	}

	if ( isJetpack || isPublicizeActive ) {
		context.primary = <ConnectionsPage />;
	} else {
		context.primary = (
			<PromoPage
				isSocialActive={
					site?.ID && !! isJetpackConnectionPluginActive( state, site.ID, 'jetpack-social' )
				}
			/>
		);
	}
	next();
};

export const redirectIfNotJetpackCloud: Callback = ( context, next ) => {
	const state = context.store.getState();
	const site = getSelectedSite( state );

	if ( ! isJetpackCloud() ) {
		return page.redirect( `/marketing/connections${ site?.slug ? '/' + site.slug : '' }` );
	}

	next();
};
