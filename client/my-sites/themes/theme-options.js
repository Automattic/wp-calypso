/** @ssr-ready **/

/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import i18n from 'i18n-calypso';
import mapValues from 'lodash/mapValues';
import merge from 'lodash/merge';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	activate as activateAction
} from 'state/themes/actions';
import {
	isPremiumTheme as isPremium
} from 'state/themes/utils';
import {
	getThemeSignupUrl as getSignupUrl,
	getThemePurchaseUrl as getPurchaseUrl,
	getThemeCustomizeUrl as	getCustomizeUrl,
	getThemeDetailsUrl as getDetailsUrl,
	getThemeSupportUrl as getSupportUrl,
	getThemeHelpUrl as getHelpUrl
} from 'state/themes/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { canCurrentUser } from 'state/current-user/selectors';
import { getSelectedSite } from 'state/ui/selectors';

export const purchase = config.isEnabled( 'upgrades/checkout' )
	? {
		label: i18n.translate( 'Purchase', {
			context: 'verb'
		} ),
		header: i18n.translate( 'Purchase on:', {
			context: 'verb',
			comment: 'label for selecting a site for which to purchase a theme'
		} ),
		getUrl: getPurchaseUrl,
		hideForTheme: theme => ! theme.price || theme.active || theme.purchased
	}
	: {};

export const activate = {
	label: i18n.translate( 'Activate' ),
	header: i18n.translate( 'Activate on:', { comment: 'label for selecting a site on which to activate a theme' } ),
	action: activateAction,
	hideForTheme: theme => theme.active || ( theme.price && ! theme.purchased )
};

export const customize = {
	label: i18n.translate( 'Customize' ),
	header: i18n.translate( 'Customize on:', { comment: 'label in the dialog for selecting a site for which to customize a theme' } ),
	icon: 'customize',
	getUrl: getCustomizeUrl,
	hideForSite: ( state, site ) => ! canCurrentUser( state, site, 'edit_theme_options' ),
	hideForTheme: theme => ! theme.active
};

export const tryandcustomize = {
	label: i18n.translate( 'Try & Customize' ),
	header: i18n.translate( 'Try & Customize on:', {
		comment: 'label in the dialog for opening the Customizer with the theme in preview'
	} ),
	getUrl: getCustomizeUrl,
	hideForSite: ( state, site ) => ! canCurrentUser( state, site, 'edit_theme_options' ),
	hideForTheme: theme => theme.active
};

// This is a special option that gets its `action` added by `ThemeShowcase` or `ThemeSheet`,
// respectively. TODO: Replace with a real action once we're able to use `SitePreview`.
export const preview = {
	label: i18n.translate( 'Live demo', {
		comment: 'label for previewing the theme demo website'
	} ),
	hideForSite: ( state, site ) => isJetpackSite( state, site ),
	hideForTheme: theme => theme.active
};

export const signup = {
	label: i18n.translate( 'Pick this design', {
		comment: 'when signing up for a WordPress.com account with a selected theme'
	} ),
	getUrl: getSignupUrl
};

export const separator = {
	separator: true
};

export const info = {
	label: i18n.translate( 'Info', {
		comment: 'label for displaying the theme info sheet'
	} ),
	icon: 'info',
	getUrl: getDetailsUrl,
};

export const support = {
	label: i18n.translate( 'Setup' ),
	icon: 'help',
	getUrl: getSupportUrl,
	// We don't know where support docs for a given theme on a self-hosted WP install are.
	hideForSite: ( state, site ) => isJetpackSite( state, site ),
	hideForTheme: theme => ! isPremium( theme )
};

export const help = {
	label: i18n.translate( 'Support' ),
	getUrl: getHelpUrl,
	// We don't know where support docs for a given theme on a self-hosted WP install are.
	hideForSite: ( state, site ) => isJetpackSite( state, site ),
};

export function bindOptionToDispatch( option, source ) {
	return dispatch => Object.assign(
		{},
		//option,
		option.action
			? { action: bindActionCreators(
				( theme, site ) => option.action( theme, site, source ),
				dispatch
				) }
			: {}
	);
}

export const bindOptionsToDispatch = ( dispatch, { options, source } ) => (
	mapValues( options, option => bindOptionToDispatch( option, source )( dispatch ) )
);

function bindOptionToState( option, state ) {
	return Object.assign(
		{},
		option,
		option.getUrl
			? { getUrl: ( theme, siteId ) => option.getUrl( state, theme, siteId ) }
			: {},
		option.hideForSite
			? { hideForSite: siteId => option.hideForSite( state, siteId ) }
			: {},
	);
}

// Sig: state, ownProps?
export function bindOptionsToState( options, state ) {
	return mapValues( options, option => bindOptionToState( option, state ) );
}

export const bindToState = ( state, { options } ) => ( {
	options: bindOptionsToState( options, state )
} );

// Ideally: same sig as mergeProps. stateProps, dispatchProps, ownProps
function bindOptionToSite( option, site ) {
	return Object.assign(
		{},
		option,
		option.action
			? { action: theme => option.action( theme, site ) } // TODO (@ockham): Change actions to use siteId.
			: {},
		option.getUrl
			? { getUrl: ( state, theme ) => option.getUrl( state, theme, site.ID ) }
			: {},
		option.hideForSite
			? { hideForSite: state => option.hideForSite( state, site.ID ) }
			: {},
	);
}

export function bindOptionsToSite( options, site ) {
	return mapValues( options, option => bindOptionToSite( option, site ) );
}

export const bindToSite = ( state, { options } ) => ( {
	options: bindOptionsToSite( options, getSelectedSite( state ) )
} );

export const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const options = merge(
		{},
		stateProps.options,
		dispatchProps
	);

	return Object.assign(
		{},
		ownProps,
		stateProps,
		{
			options,
			defaultOption: options[ ownProps.defaultOption ],
			secondaryOption: options[ ownProps.secondaryOption ],
			getScreenshotOption: function( theme ) {
				const screenshotOption = ownProps.getScreenshotOption( theme );
				return options[ screenshotOption ];
			}
		}
	);
};

export const bindOptions = [
	bindToState,
	bindOptionsToDispatch,
	mergeProps
];
