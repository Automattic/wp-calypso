import page, { type Callback } from '@automattic/calypso-router';
import { translate } from 'i18n-calypso';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { errorNotice } from 'calypso/state/notices/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isAtomicSite from 'calypso/state/selectors/is-site-wpcom-atomic';
import {
	isJetpackSite,
	isJetpackModuleActive,
	isJetpackConnectionPluginActive,
	isSimpleSite,
} from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ConnectionsPage from './connections';
import PromoPage from './promo';

export const connections: Callback = ( context, next ) => {
	const { store } = context;
	const { dispatch } = store;
	const state = store.getState();
	const site = getSelectedSite( state );
	const isSimple = isSimpleSite( state, site?.ID );
	const isAJetpackSite =
		site?.ID && isJetpackSite( state, site.ID, { treatAtomicAsJetpackSite: false } );
	const isAtomic = site?.ID && isAtomicSite( state, site.ID );
	const isPublicizeActive = site?.ID && isJetpackModuleActive( state, site.ID, 'publicize' );

	const isSocialActive =
		site?.ID && isJetpackConnectionPluginActive( state, site?.ID, 'jetpack-social' );
	const isJetpackActive =
		site?.ID && isJetpackSite( state, site?.ID, { considerStandaloneProducts: false } );

	if ( site?.ID && ! canCurrentUser( state, site.ID, 'publish_posts' ) ) {
		dispatch(
			errorNotice(
				translate( 'You are not authorized to manage social media connections for this site.' )
			)
		);
	}

	// Publicize can remain enabled even if the plugins are not active,
	// So we need to check if any of the plugins are active.
	const hasSocialSharingEnabled = isPublicizeActive && ( isSocialActive || isJetpackActive );

	if ( isAtomic || isSimple || ( isAJetpackSite && hasSocialSharingEnabled ) ) {
		context.primary = <ConnectionsPage />;
	} else {
		context.primary = <PromoPage />;
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
