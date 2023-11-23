import { isEnabled } from '@automattic/calypso-config';
import page, { type Callback } from '@automattic/calypso-router';
import { translate } from 'i18n-calypso';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import AddOnsMain from './main';

export const addOnsSiteSelectionHeader: Callback = ( context, next ) => {
	context.getSiteSelectionHeaderText = () => {
		return translate( 'Select a site to open {{strong}}Add-Ons{{/strong}}', {
			components: {
				strong: <strong />,
			},
		} );
	};

	next();
};

export const addOnsManagement: Callback = ( context, next ) => {
	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );

	if ( ! selectedSite ) {
		page.redirect( '/add-ons' );

		return null;
	}

	context.primary = <AddOnsMain />;

	next();
};

export const redirectIfNotEnabled: Callback = ( context, next ) => {
	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );

	if ( ! isEnabled( 'my-sites/add-ons' ) ) {
		page.redirect( selectedSite ? `/home/${ selectedSite.slug }` : '/home' );
		return null;
	}

	next();
};
