import { addQueryArgs } from '@wordpress/url';
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
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { isJetpackSite, isJetpackSiteMultiSite, getSiteSlug } from 'calypso/state/sites/selectors';
import {
	activate as activateAction,
	tryAndCustomize as tryAndCustomizeAction,
	confirmDelete,
	showThemePreview as themePreview,
	addExternalManagedThemeToCart,
	livePreview as livePreviewAction,
} from 'calypso/state/themes/actions';
import {
	getJetpackUpgradeUrlIfPremiumTheme,
	getTheme,
	getThemeDemoUrl,
	getThemeDetailsUrl,
	getThemeSignupUrl,
	isPremiumThemeAvailable,
	isThemeActive,
	isThemePremium,
	doesThemeBundleSoftwareSet,
	shouldShowTryAndCustomize,
	isExternallyManagedTheme,
	isSiteEligibleForManagedExternalThemes,
	isWpcomTheme,
	getIsLivePreviewSupported,
} from 'calypso/state/themes/selectors';
import { isMarketplaceThemeSubscribed } from 'calypso/state/themes/selectors/is-marketplace-theme-subscribed';

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
		getUrl: ( state, themeId, siteId, options ) => {
			const slug = getSiteSlug( state, siteId );
			const redirectTo = encodeURIComponent(
				addQueryArgs( `/theme/${ themeId }/${ slug }`, {
					style_variation: options?.styleVariationSlug,
				} )
			);

			return `/checkout/${ slug }/value_bundle?redirect_to=${ redirectTo }`;
		},
		hideForTheme: ( state, themeId, siteId ) =>
			( isJetpackSite( state, siteId ) && ! isSiteWpcomAtomic( state, siteId ) ) || // No individual theme purchase on a JP site
			! isUserLoggedIn( state ) || // Not logged in
			! siteId ||
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
			isSiteWpcomStaging( state, siteId ) || // No individual theme purchase on a staging site
			( isJetpackSite( state, siteId ) && ! isSiteWpcomAtomic( state, siteId ) ) || // No individual theme purchase on a JP site
			! isUserLoggedIn( state ) || // Not logged in
			! siteId ||
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
		getUrl: ( state, themeId, siteId, options ) =>
			getJetpackUpgradeUrlIfPremiumTheme( state, themeId, siteId, options ),
		hideForTheme: ( state, themeId, siteId ) =>
			! isJetpackSite( state, siteId ) ||
			isSiteWpcomAtomic( state, siteId ) ||
			! isUserLoggedIn( state ) ||
			! siteId ||
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
		getUrl: ( state, themeId, siteId, options ) => {
			const { origin = 'https://wordpress.com' } =
				typeof window !== 'undefined' ? window.location : {};
			const slug = getSiteSlug( state, siteId );

			const redirectTo = encodeURIComponent(
				addQueryArgs( `${ origin }/setup/site-setup/designSetup`, {
					siteSlug: slug,
					theme: themeId,
					style_variation: options?.styleVariationSlug,
				} )
			);

			return `/checkout/${ slug }/business?redirect_to=${ redirectTo }`;
		},
		hideForTheme: ( state, themeId, siteId ) =>
			isJetpackSite( state, siteId ) ||
			isSiteWpcomAtomic( state, siteId ) ||
			! isUserLoggedIn( state ) ||
			! siteId ||
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
			! siteId ||
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
			! siteId ||
			isJetpackSiteMultiSite( state, siteId ) ||
			( isExternallyManagedTheme( state, themeId ) &&
				! getTheme( state, siteId, themeId ) &&
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
		getUrl: ( state, themeId, siteId, options ) =>
			addQueryArgs( getCustomizeUrl( state, themeId, siteId, isFSEActive ), {
				style_variation: options?.styleVariationSlug,
				from: 'theme-info',
			} ),
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
			// Hide the Try & Customize when the Live Preview is supported.
			getIsLivePreviewSupported( state, themeId, siteId ) ||
			! shouldShowTryAndCustomize( state, themeId, siteId ),
	};

	const livePreview = {
		label: translate( 'Preview & Customize', {
			comment: 'label for previewing a block theme',
		} ),
		action: ( themeId, siteId ) => {
			return livePreviewAction( themeId, siteId, 'list' );
		},
		hideForTheme: ( state, themeId, siteId ) =>
			! getIsLivePreviewSupported( state, themeId, siteId ),
	};

	const preview = {
		label: translate( 'Demo site', {
			comment: 'label for previewing the theme demo website',
		} ),
		action: ( themeId, siteId ) => {
			return ( dispatch, getState ) => {
				const state = getState();
				if ( isWpcomTheme( state, themeId ) && ! isExternallyManagedTheme( state, themeId ) ) {
					return dispatch( themePreview( themeId, siteId ) );
				}
				return window.open(
					getThemeDemoUrl( state, themeId, siteId ),
					'_blank',
					'noreferrer,noopener'
				);
			};
		},
		hideForTheme: ( state, themeId, siteId ) => {
			return (
				getIsLivePreviewSupported( state, themeId, siteId ) ||
				! getThemeDemoUrl( state, themeId, siteId )
			);
		},
	};

	const signupLabel = translate( 'Pick this design', {
		comment: 'when signing up for a WordPress.com account with a selected theme',
	} );

	const signup = {
		label: signupLabel,
		extendedLabel: signupLabel,
		getUrl: ( state, themeId, siteId, options ) => getThemeSignupUrl( state, themeId, options ),
		hideForTheme: ( state, themeId, siteId ) => isUserLoggedIn( state ) && siteId,
	};

	const separator = {
		separator: true,
	};

	const info = {
		label: translate( 'Info', {
			comment: 'label for displaying the theme info sheet',
		} ),
		icon: 'info',
		getUrl: ( state, themeId, siteId, options ) =>
			getThemeDetailsUrl( state, themeId, siteId, options ),
	};

	return {
		customize,
		livePreview,
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
	};
}

const connectOptionsHoc = connect(
	( state, props ) => {
		const { siteId, origin = siteId, locale } = props;
		const isLoggedOut = ! isUserLoggedIn( state );

		/* eslint-disable wpcalypso/redux-no-bound-selectors */
		const mapGetUrl = ( getUrl ) => ( t, options ) =>
			localizeThemesPath( getUrl( state, t, siteId, options ), locale, isLoggedOut );
		const mapHideForTheme = ( hideForTheme ) => ( t, s ) =>
			hideForTheme( state, t, s ?? siteId, origin );

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
