import config from '@automattic/calypso-config';
import {
	FEATURE_WOOP,
	WPCOM_FEATURES_ATOMIC,
	WPCOM_FEATURES_PREMIUM_THEMES,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
} from '@automattic/calypso-products';
import { getCalypsoUrl } from '@automattic/calypso-url';
import { useEffect, useState, useCallback } from 'react';
import wpcom from 'calypso/lib/wp';
import tracksRecordEvent from '../../tracking/track-record-event';
import { PERSONAL_THEME, PREMIUM_THEME, WOOCOMMERCE_THEME } from '../utils';
import { usePreviewingTheme } from './use-previewing-theme';
import type { SiteDetails } from '@automattic/data-stores';

const checkNeedUpgrade = ( {
	site,
	previewingThemeType,
	requiredFeature,
}: {
	site?: SiteDetails;
	previewingThemeType?: string;
	requiredFeature?: string;
} ) => {
	const activeFeatures = site?.plan?.features?.active;
	if ( ! activeFeatures ) {
		return false;
	}

	// @TODO Replace all the logic below with the following code once Theme Tiers is live.
	if ( requiredFeature ) {
		return ! activeFeatures.includes( requiredFeature );
	}

	/**
	 * This logic is extracted from `client/state/themes/selectors/can-use-theme.js`.
	 */
	const canUseWooCommerceTheme =
		previewingThemeType === WOOCOMMERCE_THEME &&
		[ WPCOM_FEATURES_PREMIUM_THEMES, FEATURE_WOOP, WPCOM_FEATURES_ATOMIC ].every( ( feature ) =>
			activeFeatures.includes( feature )
		);
	if ( canUseWooCommerceTheme ) {
		return false;
	}
	const canUsePremiumTheme =
		previewingThemeType === PREMIUM_THEME &&
		activeFeatures.includes( WPCOM_FEATURES_PREMIUM_THEMES );
	if ( canUsePremiumTheme ) {
		return false;
	}

	return true;
};

export const useCanPreviewButNeedUpgrade = ( {
	previewingTheme,
}: {
	previewingTheme: ReturnType< typeof usePreviewingTheme >;
} ) => {
	const [ canPreviewButNeedUpgrade, setCanPreviewButNeedUpgrade ] = useState( false );
	const [ siteSlug, setSiteSlug ] = useState< string | undefined >();

	/**
	 * Get the theme and site info to decide whether the user needs to upgrade the plan.
	 */
	useEffect( () => {
		const livePreviewUpgradeTypes = [ WOOCOMMERCE_THEME, PREMIUM_THEME ];

		if ( config.isEnabled( 'themes/tiers' ) ) {
			livePreviewUpgradeTypes.push( PERSONAL_THEME );
		}

		/**
		 * Currently, Live Preview only supports upgrades for WooCommerce and Premium themes.
		 */
		if ( previewingTheme?.type && livePreviewUpgradeTypes.includes( previewingTheme.type ) ) {
			setCanPreviewButNeedUpgrade( false );
			return;
		}

		wpcom.req
			.get( `/sites/${ window._currentSiteId }`, { apiVersion: '1.2' } )
			.then( ( site: any ) => {
				let parsedUrl;
				try {
					parsedUrl = new URL( site.URL );
					const { hostname } = parsedUrl;
					setSiteSlug( hostname );
				} catch {
					// Invalid URL
				}
				return site;
			} )
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.then( ( site: any ) => {
				if (
					! checkNeedUpgrade( {
						site,
						previewingThemeType: previewingTheme.type,
						requiredFeature: previewingTheme.requiredFeature,
					} )
				) {
					setCanPreviewButNeedUpgrade( false );
					return;
				}
				setCanPreviewButNeedUpgrade( true );
			} )
			.catch( () => {
				// do nothing
			} );
	}, [
		previewingTheme.requiredFeature,
		previewingTheme.type,
		setCanPreviewButNeedUpgrade,
		setSiteSlug,
	] );

	const upgradePlan = useCallback( () => {
		tracksRecordEvent( 'calypso_block_theme_live_preview_upgrade_modal_upgrade', {
			theme: previewingTheme.id,
			theme_type: previewingTheme.type,
		} );

		const generateCheckoutUrl = ( plan: string ) => {
			const locationHref = window.location.href;
			let url = locationHref;
			try {
				/**
				 * If the site has a custom domain, change the hostname to a custom domain.
				 * This allows the checkout to redirect back to the custom domain.
				 * @see `client/my-sites/checkout/src/hooks/use-valid-checkout-back-url.ts`
				 */
				if ( siteSlug ) {
					const parsedUrl = new URL( locationHref );
					parsedUrl.hostname = siteSlug;
					url = parsedUrl.toString();
				}
			} catch ( error ) {
				// Do nothing.
			}
			return `${ getCalypsoUrl() }/checkout/${
				window._currentSiteId
			}/${ plan }?redirect_to=${ encodeURIComponent( url ) }&checkoutBackUrl=${ encodeURIComponent(
				url
			) }`;
		};

		switch ( previewingTheme.type ) {
			case WOOCOMMERCE_THEME:
				window.location.href = generateCheckoutUrl( PLAN_BUSINESS );
				break;
			case PREMIUM_THEME:
				window.location.href = generateCheckoutUrl( PLAN_PREMIUM );
				break;
			case PERSONAL_THEME:
				window.location.href = generateCheckoutUrl( PLAN_PERSONAL );
				break;
		}
	}, [ previewingTheme.id, previewingTheme.type, siteSlug ] );

	return {
		canPreviewButNeedUpgrade,
		upgradePlan,
	};
};
