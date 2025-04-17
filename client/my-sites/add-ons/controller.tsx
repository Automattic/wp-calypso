import page, { type Callback } from '@automattic/calypso-router';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { isPlansPageUntangled } from 'calypso/lib/plans/untangling-plans-experiment';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
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

	if ( isPlansPageUntangled( state ) ) {
		page.redirect(
			addQueryArgs( `/plans/${ context.params.site }`, {
				...getCurrentQueryArguments( state ),
				'add-ons-modal': true,
			} )
		);

		return null;
	}

	context.primary = <AddOnsMain />;

	next();
};
