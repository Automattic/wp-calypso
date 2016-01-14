/**
 * External dependencies
 */
import assign from 'lodash/object/assign';
import mapValues from 'lodash/object/mapValues';
import pick from 'lodash/object/pick';
import merge from 'lodash/object/merge';

/**
 * Internal dependencies
 */
import Helper from 'lib/themes/helpers';
import actionLabels from './action-labels';
import config from 'config';

/*
 * The following can be see as a sort of frontend to the lib/themes/actions
 * and lib/themes/helpers modules, with different function signatures
 * streamlined, so they can be used uniformly from my-sites/themes/main.
 */
export function getButtonOptions( site, isLoggedOut, actions, letUserSelectSite, showPreview ) {
	const buttonOptions = {
		signup: {
			getUrl: theme => Helper.getSignupUrl( theme ),
			isHidden: ! isLoggedOut
		},
		preview: {
			action: theme => showPreview( theme ),
			hideForTheme: theme => theme.active
		},
		purchase: {
			action: theme => site
				? actions.purchase( theme, site, 'showcase' )
				: letUserSelectSite( 'purchase', theme ),
			isHidden: isLoggedOut || ! config.isEnabled( 'upgrades/checkout' ),
			hideForTheme: theme => theme.active || theme.purchased || ! theme.price
		},
		activate: {
			action: theme => site
				? actions.activate( theme, site, 'showcase' )
				: letUserSelectSite( 'activate', theme ),
			isHidden: isLoggedOut,
			hideForTheme: theme => theme.active || ( theme.price && ! theme.purchased )
		},
		customize: {
			action: theme => site
				? actions.customize( theme, site )
				: letUserSelectSite( 'customize', theme ),
			isHidden: isLoggedOut && ( site && ! site.isCustomizable() ),
			hideForTheme: theme => ! theme.active
		},
		separator: {
			separator: true
		},
		details: {
			getUrl: theme => Helper.getDetailsUrl( theme, site ),
		},
		support: {
			getUrl: theme => Helper.getSupportUrl( theme, site ),
			// We don't know where support docs for a given theme on a self-hosted WP install are,
			// and free themes don't have support docs.
			isHidden: site && site.jetpack,
			hideForTheme: theme => ! Helper.isPremium( theme )
		},
	};

	const options = merge( {}, buttonOptions, actionLabels );
	return pick( options, option => ! option.isHidden );
};

export function addTracking( options ) {
	return mapValues( options, appendActionTracking );
}

function appendActionTracking( option, name ) {
	const { action } = option;

	if ( ! action ) {
		return option;
	}

	return assign( {}, option, {
		action: trackedAction( action, name )
	} );
}

function trackedAction( action, name ) {
	return t => {
		action( t );
		Helper.trackClick( 'more button', name );
	};
}
