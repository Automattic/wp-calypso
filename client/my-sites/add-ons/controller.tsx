import { translate } from 'i18n-calypso';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import AddOnsMain from './main';

export const addOnsSiteSelectionHeader = ( context: PageJS.Context, next: () => void ) => {
	context.getSiteSelectionHeaderText = () => {
		return translate( 'Select a site to open {{strong}}Add Ons{{/strong}}', {
			components: {
				strong: <strong />,
			},
		} );
	};

	next();
};

export const addOnsManagement = ( context: PageJS.Context, next: () => void ) => {
	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );

	if ( ! selectedSite ) {
		page.redirect( '/add-ons' );

		return null;
	}

	context.primary = <AddOnsMain />;

	next();
};
