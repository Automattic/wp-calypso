import {
	FEATURE_WOOP,
	WPCOM_FEATURES_ATOMIC,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
} from '@automattic/calypso-products';
import { getCalypsoUrl } from '@automattic/calypso-url';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useCallback } from 'react';
import wpcom from 'calypso/lib/wp';
import tracksRecordEvent from '../../tracking/track-record-event';
import { UPGRADE_DONE_NOTICE_ID } from '../constants';
import { PERSONAL_THEME, PREMIUM_THEME, WOOCOMMERCE_THEME } from '../utils';
import { usePreviewingTheme } from './use-previewing-theme';
import { useSidebarNotice } from './use-sidebar-notice';
import type { SiteDetails } from '@automattic/data-stores';

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
		[ WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED, FEATURE_WOOP, WPCOM_FEATURES_ATOMIC ].every(
			( feature ) => activeFeatures.includes( feature )
		);
	if ( canUseWooCommerceTheme ) {
		return false;
	}
	const canUsePremiumTheme =
		previewingThemeType === PREMIUM_THEME &&
		activeFeatures.includes( WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED );
	if ( canUsePremiumTheme ) {
		return false;
	}

	return true;
};

type CheckoutStatus = 'success' | 'failure' | '';

/**
 * Display the notice of the checkout status.
 */
const useDisplayCheckoutNotice = ( checkoutStatus: CheckoutStatus ) => {
	const [ shouldShowNotice, setShouldShowNotice ] = useState( false );
	const { createNotice, removeNotice } = useDispatch( 'core/notices' );

	const getNoticeStatus = () => {
		return checkoutStatus === 'success' ? 'info' : 'error';
	};

	const getNoticeText = () => {
		return checkoutStatus === 'success'
			? __(
					'You have successfully upgraded your plan! You can now activate the theme.',
					'wpcom-live-preview'
			  )
			: __(
					"Sorry, we couldn't process your payment. Please try again later.",
					'wpcom-live-preview'
			  );
	};

	useEffect( () => {
		if ( checkoutStatus ) {
			setShouldShowNotice( true );
		}
	}, [ checkoutStatus ] );

	useEffect( () => {
		if ( ! shouldShowNotice || ! checkoutStatus ) {
			return;
		}

		createNotice( getNoticeStatus(), getNoticeText(), {
			__unstableHTML: true,
			id: UPGRADE_DONE_NOTICE_ID,
			isDismissible: true,
			onDismiss: () => {
				setShouldShowNotice( false );
			},
		} );

		return () => {
			removeNotice( UPGRADE_DONE_NOTICE_ID );
		};
	}, [
		shouldShowNotice,
		checkoutStatus,
		createNotice,
		removeNotice,
		getNoticeStatus,
		getNoticeText,
	] );

	useSidebarNotice( {
		noticeProps: {
			children: getNoticeText(),
			isDismissible: true,
			onDismiss: () => {
				setShouldShowNotice( false );
			},
			status: getNoticeStatus(),
		},
		shouldShowNotice: shouldShowNotice && !! checkoutStatus,
	} );
};

export const useCanPreviewButNeedUpgrade = (
	previewingTheme: ReturnType< typeof usePreviewingTheme >
) => {
	const [ canPreviewButNeedUpgrade, setCanPreviewButNeedUpgrade ] = useState( false );
	const [ siteSlug, setSiteSlug ] = useState< string | undefined >();
	const [ checkoutTab, setCheckoutTab ] = useState< Window | null >();
	const [ checkoutStatus, setCheckoutStatus ] = useState< CheckoutStatus >( '' );

	const handleCanPreviewButNeedUpgrade = useCallback(
		( previewingTheme: ReturnType< typeof usePreviewingTheme > ) => {
			const livePreviewUpgradeTypes = [ WOOCOMMERCE_THEME, PREMIUM_THEME, PERSONAL_THEME ];

			/**
			 * Currently, Live Preview only supports upgrades for WooCommerce and Premium themes.
			 */
			if ( ! previewingTheme?.type || ! livePreviewUpgradeTypes.includes( previewingTheme.type ) ) {
				setCanPreviewButNeedUpgrade( false );
				return;
			}

			return wpcom.req
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
						return true;
					}
					setCanPreviewButNeedUpgrade( true );
				} )
				.catch( () => {
					// do nothing
				} );
		},
		[ setCanPreviewButNeedUpgrade, setSiteSlug ]
	);

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

	useDisplayCheckoutNotice( checkoutStatus );

	useEffect( () => {
		handleCanPreviewButNeedUpgrade( previewingTheme );
	}, [ previewingTheme ] );

	useEffect( () => {
		const closeCheckoutTabAndFocus = () => {
			checkoutTab?.close();
			window.focus();
		};

		const handlePopupMessage = ( { data, origin }: MessageEvent ) => {
			if ( origin !== getCalypsoUrl() ) {
				return;
			}

			switch ( data.action ) {
				case 'checkoutCancelled': {
					closeCheckoutTabAndFocus();
					break;
				}

				case 'checkoutFailed': {
					closeCheckoutTabAndFocus();
					setCheckoutStatus( 'failure' );
					break;
				}

				case 'checkoutCompleted': {
					closeCheckoutTabAndFocus();
					handleCanPreviewButNeedUpgrade( previewingTheme ).then(
						( result?: boolean ) => !! result && setCheckoutStatus( 'success' )
					);
					break;
				}
			}
		};

		window.addEventListener( 'message', handlePopupMessage );
		return () => {
			window.removeEventListener( 'message', handlePopupMessage );
		};
	}, [ checkoutTab, previewingTheme, getCalypsoUrl, handleCanPreviewButNeedUpgrade ] );

	return {
		canPreviewButNeedUpgrade,
		upgradePlan,
	};
};
