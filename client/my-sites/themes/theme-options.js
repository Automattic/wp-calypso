/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import i18n from 'i18n-calypso';
import { has, identity, mapValues, pick, pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	activate as activateAction,
	tryAndCustomize as tryAndCustomizeAction,
	confirmDelete,
	showThemePreview as themePreview,
} from 'state/themes/actions';
import {
	getThemeSignupUrl,
	getThemePurchaseUrl,
	getThemeCustomizeUrl,
	getThemeDetailsUrl,
	getThemeSupportUrl,
	getThemeHelpUrl,
	isThemeActive,
	isThemePremium,
	isPremiumThemeAvailable,
} from 'state/themes/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { hasFeature } from 'state/sites/plans/selectors';
import { canCurrentUser } from 'state/selectors';
import { FEATURE_UNLIMITED_PREMIUM_THEMES } from 'lib/plans/constants';

const purchase = config.isEnabled( 'upgrades/checkout' )
	? {
		label: i18n.translate( 'Purchase', {
			context: 'verb'
		} ),
		extendedLabel: i18n.translate( 'Purchase this design' ),
		header: i18n.translate( 'Purchase on:', {
			context: 'verb',
			comment: 'label for selecting a site for which to purchase a theme'
		} ),
		getUrl: getThemePurchaseUrl,
		hideForSite: ( state, siteId ) => hasFeature( state, siteId, FEATURE_UNLIMITED_PREMIUM_THEMES ),
		hideForTheme: ( state, theme, siteId ) => (
			! isThemePremium( state, theme.id ) ||
			isThemeActive( state, theme.id, siteId ) ||
			isPremiumThemeAvailable( state, theme.id, siteId )
		)
	}
	: {};

const activate = {
	label: i18n.translate( 'Activate' ),
	extendedLabel: i18n.translate( 'Activate this design' ),
	header: i18n.translate( 'Activate on:', { comment: 'label for selecting a site on which to activate a theme' } ),
	action: activateAction,
	hideForTheme: ( state, theme, siteId ) => (
		isThemeActive( state, theme.id, siteId ) ||
		( isThemePremium( state, theme.id ) && ! isPremiumThemeAvailable( state, theme.id, siteId ) )
	)
};

const deleteTheme = {
	label: i18n.translate( 'Delete' ),
	action: confirmDelete,
	hideForSite: ( state, siteId ) => ! isJetpackSite( state, siteId ) || ! config.isEnabled( 'manage/themes/upload' ),
	hideForTheme: ( state, theme, siteId ) => isThemeActive( state, theme.id, siteId ),
};

const customize = {
	label: i18n.translate( 'Customize' ),
	extendedLabel: i18n.translate( 'Customize this design' ),
	header: i18n.translate( 'Customize on:', { comment: 'label in the dialog for selecting a site for which to customize a theme' } ),
	icon: 'customize',
	getUrl: getThemeCustomizeUrl,
	hideForSite: ( state, siteId ) => ! canCurrentUser( state, siteId, 'edit_theme_options' ),
	hideForTheme: ( state, theme, siteId ) => ! isThemeActive( state, theme.id, siteId )
};

const tryandcustomize = {
	label: i18n.translate( 'Try & Customize' ),
	extendedLabel: i18n.translate( 'Try & Customize' ),
	header: i18n.translate( 'Try & Customize on:', {
		comment: 'label in the dialog for opening the Customizer with the theme in preview'
	} ),
	action: tryAndCustomizeAction,
	hideForSite: ( state, siteId ) => ! canCurrentUser( state, siteId, 'edit_theme_options' ),
	hideForTheme: ( state, theme, siteId ) => isThemeActive( state, theme.id, siteId )
};

const preview = {
	label: i18n.translate( 'Live demo', {
		comment: 'label for previewing the theme demo website'
	} ),
	action: themePreview
};

const signupLabel = i18n.translate( 'Pick this design', {
	comment: 'when signing up for a WordPress.com account with a selected theme'
} );

const signup = {
	label: signupLabel,
	extendedLabel: signupLabel,
	getUrl: getThemeSignupUrl
};

const separator = {
	separator: true
};

const info = {
	label: i18n.translate( 'Info', {
		comment: 'label for displaying the theme info sheet'
	} ),
	icon: 'info',
	getUrl: getThemeDetailsUrl,
};

const support = {
	label: i18n.translate( 'Setup' ),
	icon: 'help',
	getUrl: getThemeSupportUrl,
	hideForTheme: ( state, theme ) => ! isThemePremium( state, theme.id )
};

const help = {
	label: i18n.translate( 'Support' ),
	getUrl: getThemeHelpUrl,
};

const ALL_THEME_OPTIONS = {
	customize,
	preview,
	purchase,
	activate,
	deleteTheme,
	tryandcustomize,
	signup,
	separator,
	info,
	support,
	help
};

export const connectOptions = connect(
	( state, { options: optionNames, siteId } ) => {
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
	( dispatch, { options: optionNames, siteId, source = 'unknown' } ) => {
		const options = pickBy(
			pick( ALL_THEME_OPTIONS, optionNames ),
			'action'
		);
		let mapAction;

		if ( siteId ) {
			mapAction = action => ( t ) => action( t.id, siteId, source );
		} else { // Bind only source.
			mapAction = action => ( t, s ) => action( t.id, s, source );
		}

		return bindActionCreators(
			mapValues( options, ( { action } ) => mapAction( action ) ),
			dispatch
		);
	},
	( options, actions, ownProps ) => {
		const { defaultOption, secondaryOption, getScreenshotOption } = ownProps;
		options = mapValues( options, ( option, name ) => {
			if ( has( option, 'action' ) ) {
				return { ...option, action: actions[ name ] };
			}
			return option;
		} );

		return {
			...ownProps,
			options,
			defaultOption: options[ defaultOption ],
			secondaryOption: secondaryOption ? options[ secondaryOption ] : null,
			getScreenshotOption: ( theme ) => options[ getScreenshotOption( theme ) ]
		};
	}
);
