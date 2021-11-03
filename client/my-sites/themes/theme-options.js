import config from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import { has, mapValues, pickBy, flowRight as compose } from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import withBlockEditorSettings from 'calypso/data/block-editor/with-block-editor-settings';
import { localizeThemesPath } from 'calypso/my-sites/themes/helpers';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getCustomizeUrl from 'calypso/state/selectors/get-customize-url';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import { isJetpackSite, isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import {
	activate as activateAction,
	tryAndCustomize as tryAndCustomizeAction,
	confirmDelete,
	showThemePreview as themePreview,
} from 'calypso/state/themes/actions';
import {
	getJetpackUpgradeUrlIfPremiumTheme,
	getTheme,
	getThemeDetailsUrl,
	getThemeHelpUrl,
	getThemePurchaseUrl,
	getThemeSignupUrl,
	getThemeSupportUrl,
	isPremiumThemeAvailable,
	isThemeActive,
	isThemeGutenbergFirst,
	isThemePremium,
} from 'calypso/state/themes/selectors';

const identity = ( theme ) => theme;

function getAllThemeOptions( { translate, blockEditorSettings } ) {
	const isFSEActive = blockEditorSettings?.is_fse_active ?? false;

	const purchase = config.isEnabled( 'upgrades/checkout' )
		? {
				label: translate( 'Purchase', {
					context: 'verb',
				} ),
				extendedLabel: translate( 'Purchase this design' ),
				header: translate( 'Purchase on:', {
					context: 'verb',
					comment: 'label for selecting a site for which to purchase a theme',
				} ),
				getUrl: getThemePurchaseUrl,
				hideForTheme: ( state, themeId, siteId ) =>
					isJetpackSite( state, siteId ) || // No individual theme purchase on a JP site
					! isUserLoggedIn( state ) || // Not logged in
					! isThemePremium( state, themeId ) || // Not a premium theme
					isPremiumThemeAvailable( state, themeId, siteId ) || // Already purchased individually, or thru a plan
					isThemeActive( state, themeId, siteId ), // Already active
		  }
		: {};

	const upgradePlan = config.isEnabled( 'upgrades/checkout' )
		? {
				label: translate( 'Upgrade to activate', {
					comment: 'label prompting user to upgrade the Jetpack plan to activate a certain theme',
				} ),
				extendedLabel: translate( 'Upgrade to activate', {
					comment: 'label prompting user to upgrade the Jetpack plan to activate a certain theme',
				} ),
				header: translate( 'Upgrade on:', {
					context: 'verb',
					comment: 'label for selecting a site for which to upgrade a plan',
				} ),
				getUrl: ( state, themeId, siteId ) =>
					getJetpackUpgradeUrlIfPremiumTheme( state, themeId, siteId ),
				hideForTheme: ( state, themeId, siteId ) =>
					! isJetpackSite( state, siteId ) ||
					! isUserLoggedIn( state ) ||
					! isThemePremium( state, themeId ) ||
					isThemeActive( state, themeId, siteId ) ||
					isPremiumThemeAvailable( state, themeId, siteId ),
		  }
		: {};

	const activate = {
		label: translate( 'Activate' ),
		extendedLabel: translate( 'Activate this design' ),
		header: translate( 'Activate on:', {
			comment: 'label for selecting a site on which to activate a theme',
		} ),
		action: activateAction,
		hideForTheme: ( state, themeId, siteId ) =>
			! isUserLoggedIn( state ) ||
			isJetpackSiteMultiSite( state, siteId ) ||
			isThemeActive( state, themeId, siteId ) ||
			( isThemePremium( state, themeId ) && ! isPremiumThemeAvailable( state, themeId, siteId ) ),
	};

	const deleteTheme = {
		label: translate( 'Delete' ),
		action: confirmDelete,
		hideForTheme: ( state, themeId, siteId, origin ) =>
			! isJetpackSite( state, siteId ) ||
			origin === 'wpcom' ||
			! getTheme( state, siteId, themeId ) ||
			isThemeActive( state, themeId, siteId ),
	};

	const customize = {
		icon: 'customize',
		hideForTheme: ( state, themeId, siteId ) =>
			! canCurrentUser( state, siteId, 'edit_theme_options' ) ||
			! isThemeActive( state, themeId, siteId ),
	};

	if ( isFSEActive ) {
		customize.label = translate( 'Edit', { comment: "label for button to edit a theme's design" } );
		customize.extendedLabel = translate( 'Edit this design' );
		customize.header = translate( 'Edit design on:', {
			comment: "label in the dialog for selecting a site for which to edit a theme's design",
		} );
		customize.getUrl = ( state, _themeId, siteId ) => getSiteEditorUrl( state, siteId );
	} else {
		customize.label = translate( 'Customize' );
		customize.extendedLabel = translate( 'Customize this design' );
		customize.header = translate( 'Customize on:', {
			comment: 'label in the dialog for selecting a site for which to customize a theme',
		} );
		customize.getUrl = getCustomizeUrl;
	}

	const tryandcustomize = {
		label: translate( 'Try & Customize' ),
		extendedLabel: translate( 'Try & Customize' ),
		header: translate( 'Try & Customize on:', {
			comment: 'label in the dialog for opening the Customizer with the theme in preview',
		} ),
		action: tryAndCustomizeAction,
		hideForTheme: ( state, themeId, siteId ) =>
			! isUserLoggedIn( state ) ||
			( siteId &&
				( ! canCurrentUser( state, siteId, 'edit_theme_options' ) ||
					( isJetpackSite( state, siteId ) && isJetpackSiteMultiSite( state, siteId ) ) ) ) ||
			isThemeActive( state, themeId, siteId ) ||
			( isThemePremium( state, themeId ) &&
				isJetpackSite( state, siteId ) &&
				! isPremiumThemeAvailable( state, themeId, siteId ) ) ||
			isThemeGutenbergFirst( state, themeId ),
	};

	const preview = {
		label: translate( 'Live demo', {
			comment: 'label for previewing the theme demo website',
		} ),
		action: themePreview,
	};

	const signupLabel = translate( 'Pick this design', {
		comment: 'when signing up for a WordPress.com account with a selected theme',
	} );

	const signup = {
		label: signupLabel,
		extendedLabel: signupLabel,
		getUrl: getThemeSignupUrl,
		hideForTheme: ( state ) => isUserLoggedIn( state ),
	};

	const separator = {
		separator: true,
	};

	const info = {
		label: translate( 'Info', {
			comment: 'label for displaying the theme info sheet',
		} ),
		icon: 'info',
		getUrl: getThemeDetailsUrl,
	};

	const support = {
		label: translate( 'Setup' ),
		icon: 'help',
		getUrl: getThemeSupportUrl,
		hideForTheme: ( state, themeId ) => ! isThemePremium( state, themeId ),
	};

	const help = {
		label: translate( 'Support' ),
		getUrl: getThemeHelpUrl,
	};

	return {
		customize,
		preview,
		purchase,
		upgradePlan,
		activate,
		tryandcustomize,
		deleteTheme,
		signup,
		separator,
		info,
		support,
		help,
	};
}

const connectOptionsHoc = connect(
	( state, props ) => {
		const { siteId, origin = siteId, locale } = props;
		const isLoggedOut = ! isUserLoggedIn( state );
		let mapGetUrl = identity;
		let mapHideForTheme = identity;

		/* eslint-disable wpcalypso/redux-no-bound-selectors */
		if ( siteId ) {
			mapGetUrl = ( getUrl ) => ( t ) =>
				localizeThemesPath( getUrl( state, t, siteId ), locale, isLoggedOut );
			mapHideForTheme = ( hideForTheme ) => ( t ) => hideForTheme( state, t, siteId, origin );
		} else {
			mapGetUrl = ( getUrl ) => ( t, s ) =>
				localizeThemesPath( getUrl( state, t, s ), locale, isLoggedOut );
			mapHideForTheme = ( hideForTheme ) => ( t, s ) => hideForTheme( state, t, s, origin );
		}

		return mapValues( getAllThemeOptions( props ), ( option ) =>
			Object.assign(
				{},
				option,
				option.getUrl ? { getUrl: mapGetUrl( option.getUrl ) } : {},
				option.hideForTheme ? { hideForTheme: mapHideForTheme( option.hideForTheme ) } : {}
			)
		);
		/* eslint-enable wpcalypso/redux-no-bound-selectors */
	},
	( dispatch, props ) => {
		const { siteId, source = 'unknown' } = props;
		const options = pickBy( getAllThemeOptions( props ), 'action' );
		let mapAction;

		if ( siteId ) {
			mapAction = ( action ) => ( t ) => action( t, siteId, source );
		} else {
			// Bind only source.
			mapAction = ( action ) => ( t, s ) => action( t, s, source );
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
			secondaryOption: secondaryOption ? options[ secondaryOption ] : null,
			getScreenshotOption: ( theme ) => options[ getScreenshotOption( theme ) ],
		};
	}
);

export const connectOptions = compose( localize, withBlockEditorSettings, connectOptionsHoc );
