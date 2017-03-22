/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import i18n from 'i18n-calypso';
import { has, identity, mapValues, pickBy } from 'lodash';

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
	isThemeAvailableOnJetpackSite
} from 'state/themes/selectors';
import {
	isJetpackSite,
	isJetpackSiteMultiSite
} from 'state/sites/selectors';
import { hasFeature } from 'state/sites/plans/selectors';
import { canCurrentUser } from 'state/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
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
		hideForTheme: ( state, themeId, siteId ) => (
			! getCurrentUser( state ) ||
			hasFeature( state, siteId, FEATURE_UNLIMITED_PREMIUM_THEMES ) ||
			isJetpackSite( state, siteId ) ||
			! isThemePremium( state, themeId ) ||
			isThemeActive( state, themeId, siteId ) ||
			isPremiumThemeAvailable( state, themeId, siteId )
		)
	}
	: {};

const activate = {
	label: i18n.translate( 'Activate' ),
	extendedLabel: i18n.translate( 'Activate this design' ),
	header: i18n.translate( 'Activate on:', { comment: 'label for selecting a site on which to activate a theme' } ),
	action: activateAction,
	hideForTheme: ( state, themeId, siteId ) => (
		! getCurrentUser( state ) ||
		( isJetpackSite( state, siteId ) && isJetpackSiteMultiSite( state, siteId ) ) ||
		isThemeActive( state, themeId, siteId ) ||
		( isThemePremium( state, themeId ) && ! isPremiumThemeAvailable( state, themeId, siteId ) ) ||
		( isJetpackSite( state, siteId ) && ! isThemeAvailableOnJetpackSite( state, themeId, siteId ) )
	)
};

const deleteTheme = {
	label: i18n.translate( 'Delete' ),
	action: confirmDelete,
	hideForTheme: ( state, themeId, siteId, origin ) => (
		! isJetpackSite( state, siteId ) ||
		! config.isEnabled( 'manage/themes/upload' ) ||
		origin === 'wpcom' ||
		isThemeActive( state, themeId, siteId )
	)
};

const customize = {
	label: i18n.translate( 'Customize' ),
	extendedLabel: i18n.translate( 'Customize this design' ),
	header: i18n.translate( 'Customize on:', { comment: 'label in the dialog for selecting a site for which to customize a theme' } ),
	icon: 'customize',
	getUrl: getThemeCustomizeUrl,
	hideForTheme: ( state, themeId, siteId ) => (
		! canCurrentUser( state, siteId, 'edit_theme_options' ) ||
		! isThemeActive( state, themeId, siteId )
	)
};

const tryandcustomize = {
	label: i18n.translate( 'Try & Customize' ),
	extendedLabel: i18n.translate( 'Try & Customize' ),
	header: i18n.translate( 'Try & Customize on:', {
		comment: 'label in the dialog for opening the Customizer with the theme in preview'
	} ),
	action: tryAndCustomizeAction,
	hideForTheme: ( state, themeId, siteId ) => (
		! getCurrentUser( state ) ||
		( siteId && ( ! canCurrentUser( state, siteId, 'edit_theme_options' ) ||
		( isJetpackSite( state, siteId ) && isJetpackSiteMultiSite( state, siteId ) ) ) ) ||
		isThemeActive( state, themeId, siteId ) || (
			isThemePremium( state, themeId ) &&
			// In theory, we shouldn't need the isJetpackSite() check. In practice, Redux state required for isPremiumThemeAvailable
			// is less readily available since it needs to be fetched using the `QuerySitePlans` component.
			( isJetpackSite( state, siteId ) && ! isPremiumThemeAvailable( state, themeId, siteId ) )
		) ||
		( isJetpackSite( state, siteId ) && ! isThemeAvailableOnJetpackSite( state, themeId, siteId ) )
	)
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
	getUrl: getThemeSignupUrl,
	hideForTheme: ( state ) => getCurrentUser( state )
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
	hideForTheme: ( state, themeId ) => ! isThemePremium( state, themeId )
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
	tryandcustomize,
	deleteTheme,
	signup,
	separator,
	info,
	support,
	help
};

export const connectOptions = connect(
	( state, { siteId, origin = siteId } ) => {
		let mapGetUrl = identity, mapHideForTheme = identity;

		if ( siteId ) {
			mapGetUrl = getUrl => ( t ) => getUrl( state, t, siteId );
			mapHideForTheme = hideForTheme => ( t ) => hideForTheme( state, t, siteId, origin );
		} else {
			mapGetUrl = getUrl => ( t, s ) => getUrl( state, t, s );
			mapHideForTheme = hideForTheme => ( t, s ) => hideForTheme( state, t, s, origin );
		}

		return mapValues( ALL_THEME_OPTIONS, option => Object.assign(
			{},
			option,
			option.getUrl
				? { getUrl: mapGetUrl( option.getUrl ) }
				: {},
			option.hideForTheme
				? { hideForTheme: mapHideForTheme( option.hideForTheme ) }
				: {}
		) );
	},
	( dispatch, { siteId, source = 'unknown' } ) => {
		const options = pickBy( ALL_THEME_OPTIONS, 'action' );
		let mapAction;

		if ( siteId ) {
			mapAction = action => ( t ) => action( t, siteId, source );
		} else { // Bind only source.
			mapAction = action => ( t, s ) => action( t, s, source );
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
