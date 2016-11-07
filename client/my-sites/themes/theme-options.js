/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import i18n from 'i18n-calypso';
import { has, identity, mapValues, pick, pickBy } from 'lodash';

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
	getThemeHelpUrl as getHelpUrl,
	isThemeActive as isActive
} from 'state/themes/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { canCurrentUser } from 'state/current-user/selectors';

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
		hideForTheme: ( state, theme, site ) => ! theme.price || isActive( state, theme.id, site ) || theme.purchased
	}
	: {};

export const activate = {
	label: i18n.translate( 'Activate' ),
	header: i18n.translate( 'Activate on:', { comment: 'label for selecting a site on which to activate a theme' } ),
	action: activateAction,
	hideForTheme: ( state, theme, site ) => isActive( state, theme.id, site ) || ( theme.price && ! theme.purchased )
};

export const customize = {
	label: i18n.translate( 'Customize' ),
	header: i18n.translate( 'Customize on:', { comment: 'label in the dialog for selecting a site for which to customize a theme' } ),
	icon: 'customize',
	getUrl: getCustomizeUrl,
	hideForSite: ( state, site ) => ! canCurrentUser( state, site, 'edit_theme_options' ),
	hideForTheme: ( state, theme, site ) => ! isActive( state, theme.id, site )
};

export const tryandcustomize = {
	label: i18n.translate( 'Try & Customize' ),
	header: i18n.translate( 'Try & Customize on:', {
		comment: 'label in the dialog for opening the Customizer with the theme in preview'
	} ),
	getUrl: getCustomizeUrl,
	hideForSite: ( state, site ) => ! canCurrentUser( state, site, 'edit_theme_options' ),
	hideForTheme: ( state, theme, site ) => isActive( state, theme.id, site )
};

// This is a special option that gets its `action` added by `ThemeShowcase` or `ThemeSheet`,
// respectively. TODO: Replace with a real action once we're able to use `SitePreview`.
export const preview = {
	label: i18n.translate( 'Live demo', {
		comment: 'label for previewing the theme demo website'
	} ),
	hideForSite: ( state, site ) => isJetpackSite( state, site ),
	hideForTheme: ( state, theme, site ) => isActive( state, theme.id, site )
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
	hideForTheme: ( state, theme ) => ! isPremium( theme )
};

export const help = {
	label: i18n.translate( 'Support' ),
	getUrl: getHelpUrl,
	// We don't know where support docs for a given theme on a self-hosted WP install are.
	hideForSite: ( state, site ) => isJetpackSite( state, site ),
};

const ThemeOptionsComponent = ( { children, options, defaultOption, secondaryOption, getScreenshotOption } ) => (
	React.cloneElement(
		children,
		{
			options,
			defaultOption: options[ defaultOption ],
			secondaryOption: secondaryOption ? options[ secondaryOption ] : null,
			getScreenshotOption: ( theme ) => options[ getScreenshotOption( theme ) ]
		}
	)
);

const ALL_THEME_OPTIONS = {
	customize,
	preview,
	purchase,
	activate,
	tryandcustomize,
	signup,
	separator,
	info,
	support,
	help
};

const ALL_THEME_ACTIONS = { activate: activateAction }; // All theme related actions available.

export default connect(
	( state, { options: optionNames, siteId, theme } ) => {
		let options = pick( ALL_THEME_OPTIONS, optionNames );
		let mapGetUrl = identity, mapHideForSite = identity;

		// We bind hideForTheme to siteId even if it is null since the selectors
		// that are used by it are expected to recognize that case as "no site selected"
		// and work accordingly.
		const mapHideForTheme = hideForTheme => ( t ) => hideForTheme( state, t, siteId );

		if ( siteId ) {
			mapGetUrl = getUrl => ( t ) => getUrl( state, t, siteId );
			options = pickBy( options, option =>
				! ( option.hideForSite && option.hideForSite( state, siteId ) )
			);
			if ( theme ) {
				options = pickBy( options, option =>
					! ( option.hideForTheme && option.hideForTheme( state, theme, siteId ) )
				);
			}
		} else {
			mapGetUrl = getUrl => ( t, s ) => getUrl( state, t, s );
			mapHideForSite = hideForSite => ( s ) => hideForSite( state, s );
		}

		return mapValues( options, option => Object.assign(
			{},
			option,
			option.getUrl
				? { getUrl: mapGetUrl( option.getUrl ) }
				: {},
			option.hideForSite
				? { hideForSite: mapHideForSite( option.hideForSite ) }
				: {},
			option.hideForTheme
				? { hideForTheme: mapHideForTheme( option.hideForTheme ) }
				: {}
		) );
	},
	( dispatch, { siteId, source = 'unknown' } ) => {
		let mapAction;

		if ( siteId ) {
			mapAction = action => ( t ) => action( t, siteId, source );
		} else { // Bind only source.
			mapAction = action => ( t, s ) => action( t, s, source );
		}

		return bindActionCreators(
			mapValues( ALL_THEME_ACTIONS, action => mapAction( action ) ),
			dispatch
		);
	},
	( options, actions, ownProps ) => ( {
		...ownProps,
		options: mapValues( options, ( option, name ) => {
			if ( has( actions, name ) ) {
				return { ...option, action: actions[ name ] };
			}
			return option;
		} )
	} )
)( ThemeOptionsComponent );
