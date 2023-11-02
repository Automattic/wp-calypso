import {
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	FEATURE_WOOP,
	WPCOM_FEATURES_ATOMIC,
	WPCOM_FEATURES_PREMIUM_THEMES,
} from '@automattic/calypso-products';
import { getCalypsoUrl } from '@automattic/calypso-url';
import { useDispatch, useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useEffect, useState } from 'react';
import wpcom from 'calypso/lib/wp';
import { currentlyPreviewingTheme, isPreviewingTheme } from './utils';
import type { SiteDetails } from '@automattic/data-stores';
import type { Theme } from 'calypso/types';

declare global {
	interface Window {
		_currentSiteId: number;
	}
}

const UPGRADE_NOTICE_ID = 'wpcom-live-preview/notice/upgrade';
const WOOCOMMERCE_THEME = 'woocommerce';
const PREMIUM_THEME = 'premium';

const getThemeType = ( theme?: Theme ) => {
	const theme_software_set = theme?.taxonomies?.theme_software_set;
	const isWooCommerceTheme = theme_software_set && theme_software_set.length > 0;
	if ( isWooCommerceTheme ) {
		return WOOCOMMERCE_THEME;
	}
	const themeStylesheet = theme?.stylesheet;
	const isPremiumTheme = themeStylesheet && themeStylesheet.startsWith( 'premium/' );
	if ( isPremiumTheme ) {
		return PREMIUM_THEME;
	}
	return undefined;
};

const checkNeedUpgrade = ( { site, themeType }: { site?: SiteDetails; themeType: string } ) => {
	const activeFeatures = site?.plan?.features?.active;
	if ( ! activeFeatures ) {
		return false;
	}

	/**
	 * This logic is extracted from `client/state/themes/selectors/can-use-theme.js`.
	 */
	const canUseWooCommerceTheme =
		themeType === WOOCOMMERCE_THEME &&
		[ WPCOM_FEATURES_PREMIUM_THEMES, FEATURE_WOOP, WPCOM_FEATURES_ATOMIC ].every( ( feature ) =>
			activeFeatures.includes( feature )
		);
	if ( canUseWooCommerceTheme ) {
		return false;
	}
	const canUsePremiumTheme =
		themeType === PREMIUM_THEME && activeFeatures.includes( WPCOM_FEATURES_PREMIUM_THEMES );
	if ( canUsePremiumTheme ) {
		return false;
	}

	return true;
};

export const LivePreviewUpgradeNotice = () => {
	const previewingThemeSlug = currentlyPreviewingTheme();
	const previewingThemeId =
		( previewingThemeSlug as string )?.split( '/' )?.[ 1 ] || previewingThemeSlug;
	const [ previewingThemeName, setPreviewingThemeName ] = useState< string >(
		previewingThemeSlug as string
	);

	const [ canPreviewButNeedUpgrade, setCanPreviewButNeedUpgrade ] = useState( false );
	const [ themeType, setThemeType ] = useState< string >();

	const siteEditorStore = useSelect( ( select ) => select( 'core/edit-site' ), [] );
	const { createWarningNotice, removeNotice } = useDispatch( 'core/notices' );

	const upgradePlan = useCallback( () => {
		const generateCheckoutUrl = ( plan: string ) => {
			return `${ getCalypsoUrl() }/checkout/${
				window._currentSiteId
			}/${ plan }?redirect_to=${ encodeURIComponent(
				window.location.href
			) }&checkoutBackUrl=${ encodeURIComponent( window.location.href ) }`;
		};
		const link =
			themeType === WOOCOMMERCE_THEME
				? generateCheckoutUrl( PLAN_BUSINESS ) // For a Woo Commerce theme, the users should have the Business plan or higher.
				: generateCheckoutUrl( PLAN_PREMIUM ); // For a Premium theme, the users should have the Premium plan or higher.
		window.location.href = link;

		// TODO: Add the track event.
	}, [ themeType ] );

	/**
	 * Get the theme and site info to decide whether the user needs to upgrade the plan.
	 */
	useEffect( () => {
		if ( ! themeType ) {
			wpcom.req
				.get( `/themes/${ previewingThemeId }`, { apiVersion: '1.2' } )
				.then( ( theme: Theme ) => {
					const name = theme?.name;
					if ( name ) {
						setPreviewingThemeName( name );
					}
					return theme;
				} )
				.then( ( theme: Theme ) => {
					const type = getThemeType( theme );
					if ( ! type ) {
						return;
					}
					setThemeType( type );
				} )
				.catch( () => {
					// do nothing
				} );
			return;
		}

		/**
		 * Currently, Live Preview only supports upgrades for Woo Commerce and Premium themes.
		 */
		if ( themeType !== WOOCOMMERCE_THEME && themeType !== PREMIUM_THEME ) {
			setCanPreviewButNeedUpgrade( false );
			return;
		}

		wpcom.req
			.get( `/sites/${ window._currentSiteId }`, { apiVersion: '1.2' } )
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.then( ( site: any ) => {
				if ( ! checkNeedUpgrade( { site, themeType } ) ) {
					setCanPreviewButNeedUpgrade( false );
					return;
				}
				setCanPreviewButNeedUpgrade( true );
			} )
			.catch( () => {
				// do nothing
			} );
	}, [ previewingThemeId, themeType, setThemeType, setCanPreviewButNeedUpgrade ] );

	useEffect( () => {
		// Do nothing in the Post Editor context.
		if ( ! siteEditorStore ) {
			removeNotice( UPGRADE_NOTICE_ID );
			return;
		}

		if ( ! isPreviewingTheme() ) {
			removeNotice( UPGRADE_NOTICE_ID );
			return;
		}

		if ( canPreviewButNeedUpgrade ) {
			const type = themeType === WOOCOMMERCE_THEME ? 'Woo Commerce' : 'Premium';
			createWarningNotice(
				sprintf(
					// translators: %s: The theme type ('Woo Commerce' or 'Premium')
					__(
						'You are previewing the %s theme that are only available after upgrading to the Premium plan or higher.',
						'wpcom-live-preview'
					),
					type
				),
				{
					id: UPGRADE_NOTICE_ID,
					isDismissible: false,
					actions: [
						{
							label: __( 'Upgrade now', 'wpcom-live-preview' ),
							onClick: upgradePlan,
							variant: 'primary',
						},
					],
				}
			);
		}
		return () => removeNotice( UPGRADE_NOTICE_ID );
	}, [
		canPreviewButNeedUpgrade,
		createWarningNotice,
		previewingThemeName,
		removeNotice,
		siteEditorStore,
		themeType,
		upgradePlan,
	] );
	return null;
};
