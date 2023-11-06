import { PLAN_PREMIUM, PLAN_BUSINESS } from '@automattic/calypso-products';
import { getCalypsoUrl } from '@automattic/calypso-url';
import { useDispatch, useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { FC, useCallback, useEffect } from 'react';
import { WOOCOMMERCE_THEME, getUnlock, isPreviewingTheme } from './utils';

declare global {
	interface Window {
		_currentSiteId: number;
	}
}

const UPGRADE_NOTICE_ID = 'wpcom-live-preview/notice/upgrade';

const unlock = getUnlock();

export const LivePreviewUpgradeNotice: FC< {
	canPreviewButNeedUpgrade: boolean;
	previewingTheme: { name: string; type?: string };
} > = ( { canPreviewButNeedUpgrade, previewingTheme } ) => {
	const siteEditorStore = useSelect( ( select ) => select( 'core/edit-site' ), [] );
	const { createWarningNotice, removeNotice } = useDispatch( 'core/notices' );

	const dashboardLink =
		unlock &&
		siteEditorStore &&
		unlock( siteEditorStore ).getSettings().__experimentalDashboardLink;

	const upgradePlan = useCallback( () => {
		const generateCheckoutUrl = ( plan: string ) => {
			return `${ getCalypsoUrl() }/checkout/${
				window._currentSiteId
			}/${ plan }?redirect_to=${ encodeURIComponent(
				window.location.href
			) }&checkoutBackUrl=${ encodeURIComponent( window.location.href ) }`;
		};
		const link =
			previewingTheme.type === WOOCOMMERCE_THEME
				? generateCheckoutUrl( PLAN_BUSINESS ) // For a Woo Commerce theme, the users should have the Business plan or higher.
				: generateCheckoutUrl( PLAN_PREMIUM ); // For a Premium theme, the users should have the Premium plan or higher.
		window.location.href = link;

		// TODO: Add the track event.
	}, [ previewingTheme.type ] );

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
			const requiredPlan = previewingTheme.type === WOOCOMMERCE_THEME ? 'Business' : 'Premium';
			createWarningNotice(
				sprintf(
					// translators: %1$s: The previewing theme name, %2$s: The required plan name ('Business' or 'Premium')
					__(
						'You are previewing the %1$s theme. You can try out your own style customizations, which will only be saved if you activate this theme. This theme can be activated after upgrading to the %2$s plan or higher.',
						'wpcom-live-preview'
					),
					previewingTheme.name,
					requiredPlan
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
						...( dashboardLink
							? [
									{
										label: __( 'Back to themes', 'wpcom-live-preview' ),
										url: dashboardLink,
										variant: 'secondary',
									},
							  ]
							: [] ),
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
		upgradePlan,
		previewingTheme.type,
		previewingTheme.name,
		dashboardLink,
	] );
	return null;
};
