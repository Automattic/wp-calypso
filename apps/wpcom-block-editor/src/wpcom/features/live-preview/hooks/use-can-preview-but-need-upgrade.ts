import {
	FEATURE_WOOP,
	WPCOM_FEATURES_ATOMIC,
	WPCOM_FEATURES_PREMIUM_THEMES,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
} from '@automattic/calypso-products';
import { getCalypsoUrl } from '@automattic/calypso-url';
import { useEffect, useState, useCallback } from 'react';
import wpcom from 'calypso/lib/wp';
import { PREMIUM_THEME, WOOCOMMERCE_THEME } from '../utils';
import { usePreviewingTheme } from './use-previewing-theme';
import type { SiteDetails } from '@automattic/data-stores';

const checkNeedUpgrade = ( {
	site,
	previewingThemeType,
}: {
	site?: SiteDetails;
	previewingThemeType?: string;
} ) => {
	const activeFeatures = site?.plan?.features?.active;
	if ( ! activeFeatures ) {
		return false;
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
		/**
		 * Currently, Live Preview only supports upgrades for WooCommerce and Premium themes.
		 */
		if ( previewingTheme.type !== WOOCOMMERCE_THEME && previewingTheme.type !== PREMIUM_THEME ) {
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
				if ( ! checkNeedUpgrade( { site, previewingThemeType: previewingTheme.type } ) ) {
					setCanPreviewButNeedUpgrade( false );
					return;
				}
				setCanPreviewButNeedUpgrade( true );
			} )
			.catch( () => {
				// do nothing
			} );
	}, [ previewingTheme.type, setCanPreviewButNeedUpgrade, setSiteSlug ] );

	const upgradePlan = useCallback( () => {
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
		const link =
			previewingTheme.type === WOOCOMMERCE_THEME
				? generateCheckoutUrl( PLAN_BUSINESS ) // For a WooCommerce theme, the users should have the Business plan or higher.
				: generateCheckoutUrl( PLAN_PREMIUM ); // For a Premium theme, the users should have the Premium plan or higher.
		window.location.href = link;

		// TODO: Add the track event.
	}, [ previewingTheme.type, siteSlug ] );

	return {
		canPreviewButNeedUpgrade,
		upgradePlan,
	};
};
