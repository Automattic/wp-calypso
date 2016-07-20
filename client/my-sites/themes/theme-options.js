/** @ssr-ready **/

/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import i18n from 'i18n-calypso';
import mapValues from 'lodash/mapValues';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	purchase as purchaseAction,
	activate as activateAction
} from 'state/themes/actions';
import {
	getSignupUrl,
	getCustomizeUrl,
	getDetailsUrl,
	getSupportUrl,
	getHelpUrl,
	isPremium
} from './helpers';

export const purchase = config.isEnabled( 'upgrades/checkout' )
	? {
		label: i18n.translate( 'Purchase', {
			context: 'verb'
		} ),
		header: i18n.translate( 'Purchase on:', {
			context: 'verb',
			comment: 'label for selecting a site for which to purchase a theme'
		} ),
		action: purchaseAction,
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
	getUrl: ( theme, site ) => getCustomizeUrl( theme, site ),
	hideForSite: ( { isCustomizable = false } = {} ) => ! isCustomizable,
	hideForTheme: theme => ! theme.active
};

export const tryandcustomize = {
	label: i18n.translate( 'Try & Customize' ),
	header: i18n.translate( 'Try & Customize on:', {
		comment: 'label in the dialog for opening the Customizer with the theme in preview'
	} ),
	getUrl: ( theme, site ) => getCustomizeUrl( theme, site ),
	hideForSite: ( { isCustomizable = false } = {} ) => ! isCustomizable,
	hideForTheme: theme => theme.active
};

// This is a special option that gets its `action` added by `ThemeShowcase` or `ThemeSheet`,
// respectively. TODO: Replace with a real action once we're able to use `DesignPreview`.
export const preview = {
	label: i18n.translate( 'Live demo', {
		comment: 'label for previewing the theme demo website'
	} ),
	hideForSite: ( { isJetpack = false } = {} ) => isJetpack,
	hideForTheme: theme => theme.active
};

export const signup = {
	label: i18n.translate( 'Pick this design', {
		comment: 'when signing up for a WordPress.com account with a selected theme'
	} ),
	getUrl: theme => getSignupUrl( theme )
};

export const separator = {
	separator: true
};

export const info = {
	label: i18n.translate( 'Info', {
		comment: 'label for displaying the theme info sheet'
	} ),
	icon: 'info',
	getUrl: ( theme, site ) => getDetailsUrl( theme, site ), // TODO: Make this a selector
};

export const support = {
	label: i18n.translate( 'Setup' ),
	icon: 'help',
	getUrl: ( theme, site ) => getSupportUrl( theme, site ),
	// We don't know where support docs for a given theme on a self-hosted WP install are.
	hideForSite: ( { isJetpack = false } = {} ) => isJetpack,
	hideForTheme: theme => ! isPremium( theme )
};

export const help = {
	label: i18n.translate( 'Support' ),
	getUrl: ( theme, site ) => getHelpUrl( theme, site ),
	// We don't know where support docs for a given theme on a self-hosted WP install are.
	hideForSite: ( { isJetpack = false } = {} ) => isJetpack,
};

export function bindOptionToDispatch( option, source ) {
	return dispatch => Object.assign(
		{},
		option,
		option.action
			? { action: bindActionCreators(
				( theme, site ) => option.action( theme, site, source ),
				dispatch
				) }
			: {}
	);
}

export function bindOptionsToDispatch( options, source ) {
	return dispatch => mapValues( options, option => bindOptionToDispatch( option, source )( dispatch ) );
}

// Ideally: same sig as mergeProps. stateProps, dispatchProps, ownProps
function bindOptionToSite( option, site ) {
	return Object.assign(
		{},
		option,
		option.action
			? { action: theme => option.action( theme, site ) }
			: {},
		option.getUrl
			? { getUrl: theme => option.getUrl( theme, site ) }
			: {}
	);
}

export function bindOptionsToSite( options, site ) {
	return mapValues( options, option => bindOptionToSite( option, site ) );
}
