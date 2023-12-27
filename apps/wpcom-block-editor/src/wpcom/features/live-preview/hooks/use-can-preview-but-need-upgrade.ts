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
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useCallback, useRef } from 'react';
import wpcom from 'calypso/lib/wp';
import tracksRecordEvent from '../../tracking/track-record-event';
import { UPGRADE_DONE_NOTICE_ID } from '../constants';
import { PERSONAL_THEME, PREMIUM_THEME, WOOCOMMERCE_THEME } from '../utils';
import { usePreviewingTheme } from './use-previewing-theme';
import { useSidebarNotice } from './use-sidebar-notice';
import type { SiteDetails } from '@automattic/data-stores';

const POLL_INTERVAL_DEFAULT = 1000;
const POLL_INTERVAL_FACTOR = 2;
const POLL_INTERVAL_MAX = 10 * 60 * 1000;

const needUpgrade = ( {
	site,
	previewingThemeType,
	requiredFeature,
}: {
	site?: SiteDetails;
	previewingThemeType?: string;
	requiredFeature?: string;
} ) => {
	const activeFeatures = site?.plan?.features?.active;
	if ( ! activeFeatures || activeFeatures.length === 0 ) {
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

/**
 * A polling mechanism to check whether the user has upgraded the plan.
 */
const usePolling = ( {
	isPolling,
	previewingTheme,
	setCanPreviewButNeedUpgrade,
	setIsPolling,
}: {
	isPolling: boolean;
	previewingTheme: ReturnType< typeof usePreviewingTheme >;
	setCanPreviewButNeedUpgrade: ( canPreviewButNeedUpgrade: boolean ) => void;
	setIsPolling: ( isPolling: boolean ) => void;
} ) => {
	const pollInterval = useRef( POLL_INTERVAL_DEFAULT );
	const timeoutId = useRef< NodeJS.Timeout | null >( null );
	const [ visibilityChange, setVisibilityChange ] = useState( false );
	const [ shouldReflectUpgradedPlan, setShouldReflectUpgradedPlan ] = useState( false );
	const { createInfoNotice, removeNotice } = useDispatch( 'core/notices' );

	const noticeText = __(
		'You have successfully upgraded your plan! You can now activate the theme.',
		'wpcom-live-preview'
	);

	useEffect( () => {
		if ( ! isPolling ) {
			return;
		}
		// Using exponential backoff, as we don't want to make too many requests while the user is completing the purchase.
		const nextPollInterval = () =>
			Math.min( pollInterval.current * POLL_INTERVAL_FACTOR, POLL_INTERVAL_MAX );
		const poll = () => {
			wpcom.req
				.get( `/sites/${ window._currentSiteId }`, { apiVersion: '1.2' } )
				.then( ( site: any ) => {
					if ( ! needUpgrade( { site, previewingThemeType: previewingTheme.type } ) ) {
						setShouldReflectUpgradedPlan( true );
						setIsPolling( false );
						return;
					}
					pollInterval.current = nextPollInterval();
					timeoutId.current = setTimeout( poll, pollInterval.current );
				} )
				.catch( ( error: { message: string; status: number } ) => {
					if ( error.status >= 400 && error.status < 500 ) {
						return;
					}
					pollInterval.current = nextPollInterval();
					timeoutId.current = setTimeout( poll, pollInterval.current );
				} );
		};
		timeoutId.current = setTimeout( poll, pollInterval.current );
		return () => {
			if ( timeoutId.current ) {
				clearTimeout( timeoutId.current );
			}
		};
	}, [
		createInfoNotice,
		isPolling,
		previewingTheme.type,
		setCanPreviewButNeedUpgrade,
		setIsPolling,
		visibilityChange,
	] );

	// Make a request as soon as the user finishes the payment and returns to the tab.
	useEffect( () => {
		const handleVisibilityChange = () => {
			if ( document.visibilityState === 'visible' ) {
				pollInterval.current = POLL_INTERVAL_DEFAULT;
				setVisibilityChange( ( v ) => ! v );
			}
		};
		document.addEventListener( 'visibilitychange', handleVisibilityChange );
		return () => {
			document.removeEventListener( 'visibilitychange', handleVisibilityChange );
		};
	}, [] );

	useEffect( () => {
		if ( ! shouldReflectUpgradedPlan ) {
			return;
		}

		setCanPreviewButNeedUpgrade( false );
		createInfoNotice( noticeText, {
			__unstableHTML: true,
			id: UPGRADE_DONE_NOTICE_ID,
			isDismissible: true,
			onDismiss: () => {
				setShouldReflectUpgradedPlan( false );
			},
		} );

		return () => {
			removeNotice( UPGRADE_DONE_NOTICE_ID );
		};
	}, [
		createInfoNotice,
		noticeText,
		removeNotice,
		setCanPreviewButNeedUpgrade,
		shouldReflectUpgradedPlan,
	] );

	useSidebarNotice( {
		noticeProps: {
			children: noticeText,
			isDismissible: true,
			onDismiss: () => {
				setShouldReflectUpgradedPlan( false );
			},
			status: 'info',
		},
		shouldShowNotice: shouldReflectUpgradedPlan,
	} );
};

export const useCanPreviewButNeedUpgrade = ( {
	previewingTheme,
}: {
	previewingTheme: ReturnType< typeof usePreviewingTheme >;
} ) => {
	const [ canPreviewButNeedUpgrade, setCanPreviewButNeedUpgrade ] = useState( false );
	const [ siteSlug, setSiteSlug ] = useState< string | undefined >();
	const [ checkoutTab, setCheckoutTab ] = useState< Window | null >();

	const [ isPolling, setIsPolling ] = useState( false );
	usePolling( { previewingTheme, setCanPreviewButNeedUpgrade, isPolling, setIsPolling } );

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
		if ( ! previewingTheme?.type || ! livePreviewUpgradeTypes.includes( previewingTheme.type ) ) {
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
			.then( ( site: any ) => {
				if (
					! needUpgrade( {
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

		// Start polling the site info to check whether the user has upgraded the plan in a new tab.
		setIsPolling( true );

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
			}/${ plan }?checkoutBackUrl=${ encodeURIComponent( url ) }`;
		};

		let link = '';
		switch ( previewingTheme.type ) {
			/**
			 * For a WooCommerce theme, the users should have the Business plan or higher,
			 * AND the WooCommerce plugin has to be installed.
			 */
			case WOOCOMMERCE_THEME:
				link = generateCheckoutUrl( PLAN_BUSINESS );
				break;
			// For a Premium theme, the users should have the Premium plan or higher.
			case PREMIUM_THEME:
				link = generateCheckoutUrl( PLAN_PREMIUM );
				break;
			case PERSONAL_THEME:
				link = generateCheckoutUrl( PLAN_PERSONAL );
				break;
		}
		// Open the checkout in a new tab.
		if ( checkoutTab && ! checkoutTab.closed ) {
			checkoutTab.focus();
		} else {
			setCheckoutTab( window.open( link, 'wpcom-live-preview-upgrade-plan-window' ) );
		}
	}, [ checkoutTab, previewingTheme.id, previewingTheme.type, siteSlug ] );

	return {
		canPreviewButNeedUpgrade,
		upgradePlan,
	};
};
