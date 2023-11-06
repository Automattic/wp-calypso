import {
	FEATURE_WOOP,
	WPCOM_FEATURES_ATOMIC,
	WPCOM_FEATURES_PREMIUM_THEMES,
} from '@automattic/calypso-products';
import { useEffect, useState } from 'react';
import wpcom from 'calypso/lib/wp';
import { PREMIUM_THEME, WOOCOMMERCE_THEME } from '../utils';
import type { SiteDetails } from '@automattic/data-stores';

const checkNeedUpgrade = ( {
	site,
	previewingThemeType,
}: {
	site?: SiteDetails;
	previewingThemeType: string;
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
	previewingThemeType,
}: {
	previewingThemeType?: string;
} ) => {
	const [ canPreviewButNeedUpgrade, setCanPreviewButNeedUpgrade ] = useState( false );

	/**
	 * Get the theme and site info to decide whether the user needs to upgrade the plan.
	 */
	useEffect( () => {
		/**
		 * Currently, Live Preview only supports upgrades for Woo Commerce and Premium themes.
		 */
		if ( previewingThemeType !== WOOCOMMERCE_THEME && previewingThemeType !== PREMIUM_THEME ) {
			setCanPreviewButNeedUpgrade( false );
			return;
		}

		wpcom.req
			.get( `/sites/${ window._currentSiteId }`, { apiVersion: '1.2' } )
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.then( ( site: any ) => {
				if ( ! checkNeedUpgrade( { site, previewingThemeType } ) ) {
					setCanPreviewButNeedUpgrade( false );
					return;
				}
				setCanPreviewButNeedUpgrade( true );
			} )
			.catch( () => {
				// do nothing
			} );
	}, [ previewingThemeType, setCanPreviewButNeedUpgrade ] );

	return {
		canPreviewButNeedUpgrade,
	};
};
