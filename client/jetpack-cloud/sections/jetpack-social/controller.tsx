import page, { type Callback } from '@automattic/calypso-router';
import { translate } from 'i18n-calypso';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { errorNotice } from 'calypso/state/notices/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PromoPage from './promo';

export const placeholder: Callback = ( context, next ) => {
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

	context.primary = <PromoPage />;

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
