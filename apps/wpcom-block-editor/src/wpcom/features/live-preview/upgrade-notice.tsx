import { PLAN_PREMIUM, PLAN_BUSINESS } from '@automattic/calypso-products';
import { getCalypsoUrl } from '@automattic/calypso-url';
import { useDispatch, useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { FC, useCallback, useEffect } from 'react';
import { WOOCOMMERCE_THEME, isPreviewingTheme } from './utils';

declare global {
	interface Window {
		_currentSiteId: number;
	}
}

const UPGRADE_NOTICE_ID = 'wpcom-live-preview/notice/upgrade';

export const LivePreviewUpgradeNotice: FC< {
	canPreviewButNeedUpgrade: boolean;
	previewingThemeType?: string;
} > = ( { canPreviewButNeedUpgrade, previewingThemeType } ) => {
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
			previewingThemeType === WOOCOMMERCE_THEME
				? generateCheckoutUrl( PLAN_BUSINESS ) // For a Woo Commerce theme, the users should have the Business plan or higher.
				: generateCheckoutUrl( PLAN_PREMIUM ); // For a Premium theme, the users should have the Premium plan or higher.
		window.location.href = link;

		// TODO: Add the track event.
	}, [ previewingThemeType ] );

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
			const type = previewingThemeType === WOOCOMMERCE_THEME ? 'Woo Commerce' : 'Premium';
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
		removeNotice,
		siteEditorStore,
		previewingThemeType,
		upgradePlan,
	] );
	return null;
};
