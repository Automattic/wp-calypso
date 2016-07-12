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
	customize as customizeAction,
	purchase as purchaseAction,
	activate as activateAction,
	signup as signupAction
} from 'state/themes/actions';
import {
	getSignupUrl,
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
	action: customizeAction,
	hideForSite: ( { isCustomizable = false } = {} ) => ! isCustomizable,
	hideForTheme: theme => ! theme.active
};

export const tryandcustomize = {
	label: i18n.translate( 'Try & Customize' ),
	header: i18n.translate( 'Try & Customize on:', {
		comment: 'label in the dialog for opening the Customizer with the theme in preview'
	} ),
	action: customizeAction,
	hideForSite: ( { isCustomizable = false } = {} ) => ! isCustomizable,
	hideForTheme: theme => theme.active
};

export const preview = {
	label: i18n.translate( 'Live demo', {
		comment: 'label for previewing the theme demo website'
	} ),
	hideForTheme: theme => theme.active
};

export const signup = {
	label: i18n.translate( 'Pick this design', {
		comment: 'when signing up for a WordPress.com account with a selected theme'
	} ),
	action: signupAction,
	getUrl: theme => getSignupUrl( theme )
};

export const separator = {
	separator: true
};

export const info = {
	label: i18n.translate( 'Info', {
		comment: 'label for displaying the theme info sheet'
	} ),
	getUrl: ( theme, site ) => getDetailsUrl( theme, site ), // TODO: Make this a selector
};

export const support = {
	label: i18n.translate( 'Setup' ),
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
