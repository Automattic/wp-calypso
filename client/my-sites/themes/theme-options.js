import { localize } from 'i18n-calypso';
import { mapValues, pickBy, flowRight as compose } from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import withIsFSEActive from 'calypso/data/themes/with-is-fse-active';
import { localizeThemesPath } from 'calypso/my-sites/themes/helpers';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getCustomizeUrl from 'calypso/state/selectors/get-customize-url';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite, isJetpackSiteMultiSite, getSiteSlug } from 'calypso/state/sites/selectors';
import {
	activate as activateAction,
	tryAndCustomize as tryAndCustomizeAction,
	confirmDelete,
	showThemePreview as themePreview,
	addExternalManagedThemeToCart,
} from 'calypso/state/themes/actions';
import {
	getJetpackUpgradeUrlIfPremiumTheme,
	getTheme,
	getThemeDemoUrl,
	getThemeDetailsUrl,
	getThemeHelpUrl,
	getThemePurchaseUrl,
	getThemeSignupUrl,
	isPremiumThemeAvailable,
	isThemeActive,
	isThemePremium,
	doesThemeBundleSoftwareSet,
	shouldShowTryAndCustomize,
	isExternallyManagedTheme,
	isSiteEligibleForManagedExternalThemes,
	isWpcomTheme,
} from 'calypso/state/themes/selectors';
import { isMarketplaceThemeSubscribed } from 'calypso/state/themes/selectors/is-marketplace-theme-subscribed';

const identity = ( theme ) => theme;

function getAllThemeOptions( { translate, isFSEActive } ) {
	const purchase = {
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
			( isJetpackSite( state, siteId ) && ! isSiteWpcomAtomic( state, siteId ) ) || // No individual theme purchase on a JP site
			! isUserLoggedIn( state ) || // Not logged in
			! isThemePremium( state, themeId ) || // Not a premium theme
			isPremiumThemeAvailable( state, themeId, siteId ) || // Already purchased individually, or thru a plan
			doesThemeBundleSoftwareSet( state, themeId ) || // Premium themes with bundled Software Sets cannot be purchased
			isExternallyManagedTheme( state, themeId ) || // Third-party themes cannot be purchased
			isThemeActive( state, themeId, siteId ), // Already active
	};

	const subscribe = {
		label: translate( 'Subscribe', {
			context: 'verb',
		} ),
		extendedLabel: translate( 'Subscribe to this design' ),
		header: translate( 'Subscribe on:', {
			context: 'verb',
			comment: 'label for selecting a site for which to purchase a theme',
		} ),
		action: addExternalManagedThemeToCart,
		hideForTheme: ( state, themeId, siteId ) =>
			( isJetpackSite( state, siteId ) && ! isSiteWpcomAtomic( state, siteId ) ) || // No individual theme purchase on a JP site
			! isUserLoggedIn( state ) || // Not logged in
			isMarketplaceThemeSubscribed( state, themeId, siteId ) || // Already purchased individually, or thru a plan
			doesThemeBundleSoftwareSet( state, themeId ) || // Premium themes with bundled Software Sets cannot be purchased ||
			! isExternallyManagedTheme( state, themeId ) || // We're currently only subscribing to third-party themes
			( isExternallyManagedTheme( state, themeId ) &&
				! isSiteEligibleForManagedExternalThemes( state, siteId ) ) || // User must have appropriate plan to subscribe
			isThemeActive( state, themeId, siteId ), // Already active
	};

	// Jetpack-specific plan upgrade
	const upgradePlan = {
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
			isSiteWpcomAtomic( state, siteId ) ||
			! isUserLoggedIn( state ) ||
			! isThemePremium( state, themeId ) ||
			isExternallyManagedTheme( state, themeId ) ||
			isThemeActive( state, themeId, siteId ) ||
			isPremiumThemeAvailable( state, themeId, siteId ),
	};

	// WPCOM-specific plan upgrade for premium themes with bundled software sets
	const upgradePlanForBundledThemes = {
		label: translate( 'Upgrade to activate', {
			comment: 'label prompting user to upgrade the WordPress.com plan to activate a certain theme',
		} ),
		extendedLabel: translate( 'Upgrade to activate', {
			comment: 'label prompting user to upgrade the WordPress.com plan to activate a certain theme',
		} ),
		header: translate( 'Upgrade on:', {
			context: 'verb',
			comment: 'label for selecting a site for which to upgrade a plan',
		} ),
		getUrl: ( state, themeId, siteId ) => {
			const { origin = 'https://wordpress.com' } =
				typeof window !== 'undefined' ? window.location : {};
			const slug = getSiteSlug( state, siteId );
			const redirectTo = encodeURIComponent(
				`${ origin }/setup/site-setup/designSetup?siteSlug=${ slug }&theme=${ themeId }`
			);

			return `/checkout/${ slug }/business?redirect_to=${ redirectTo }`;
		},
		hideForTheme: ( state, themeId, siteId ) =>
			isJetpackSite( state, siteId ) ||
			isSiteWpcomAtomic( state, siteId ) ||
			! isUserLoggedIn( state ) ||
			! isThemePremium( state, themeId ) ||
			! doesThemeBundleSoftwareSet( state, themeId ) ||
			isExternallyManagedTheme( state, themeId ) ||
			isThemeActive( state, themeId, siteId ) ||
			isPremiumThemeAvailable( state, themeId, siteId ),
	};

	const upgradePlanForExternallyManagedThemes = {
		label: translate( 'Upgrade to subscribe', {
			comment: 'label prompting user to upgrade the WordPress.com plan to activate a certain theme',
		} ),
		extendedLabel: translate( 'Upgrade to subscribe', {
			comment: 'label prompting user to upgrade the WordPress.com plan to activate a certain theme',
		} ),
		header: translate( 'Upgrade on:', {
			context: 'verb',
			comment: 'label for selecting a site for which to upgrade a plan',
		} ),
		action: addExternalManagedThemeToCart,
		hideForTheme: ( state, themeId, siteId ) =>
			isJetpackSite( state, siteId ) ||
			isSiteWpcomAtomic( state, siteId ) ||
			! isUserLoggedIn( state ) ||
			! isExternallyManagedTheme( state, themeId ) ||
			( isExternallyManagedTheme( state, themeId ) &&
				isSiteEligibleForManagedExternalThemes( state, siteId ) ) ||
			isThemeActive( state, themeId, siteId ) ||
			isPremiumThemeAvailable( state, themeId, siteId ),
	};

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
			( isExternallyManagedTheme( state, themeId ) &&
				! isMarketplaceThemeSubscribed( state, themeId, siteId ) ) ||
			isThemeActive( state, themeId, siteId ) ||
			( ! isWpcomTheme( state, themeId ) && ! isSiteWpcomAtomic( state, siteId ) ) ||
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
		getUrl: ( state, themeId, siteId ) => getCustomizeUrl( state, themeId, siteId, isFSEActive ),
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
	} else {
		customize.label = translate( 'Customize' );
		customize.extendedLabel = translate( 'Customize this design' );
		customize.header = translate( 'Customize on:', {
			comment: 'label in the dialog for selecting a site for which to customize a theme',
		} );
	}

	const tryandcustomize = {
		label: translate( 'Try & Customize' ),
		extendedLabel: translate( 'Try & Customize' ),
		header: translate( 'Try & Customize on:', {
			comment: 'label in the dialog for opening the Customizer with the theme in preview',
		} ),
		action: tryAndCustomizeAction,
		hideForTheme: ( state, themeId, siteId ) =>
			! shouldShowTryAndCustomize( state, themeId, siteId ),
	};

	const preview = {
		label: translate( 'Live demo', {
			comment: 'label for previewing the theme demo website',
		} ),
		action: themePreview,
		hideForTheme: ( state, themeId, siteId ) => {
			const demoUrl = getThemeDemoUrl( state, themeId, siteId );

			return ! demoUrl;
		},
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

	const help = {
		label: translate( 'Support' ),
		getUrl: getThemeHelpUrl,
	};

	return {
		customize,
		preview,
		purchase,
		subscribe,
		upgradePlan,
		upgradePlanForBundledThemes,
		upgradePlanForExternallyManagedThemes,
		activate,
		tryandcustomize,
		deleteTheme,
		signup,
		separator,
		info,
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

		return mapValues( getAllThemeOptions( props ), ( option, key ) =>
			Object.assign(
				{ key },
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
			if ( option.hasOwnProperty( 'action' ) ) {
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

export const connectOptions = compose( localize, withIsFSEActive, connectOptionsHoc );
