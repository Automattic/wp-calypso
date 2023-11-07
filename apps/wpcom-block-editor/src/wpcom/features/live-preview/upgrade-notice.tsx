import { PLAN_PREMIUM, PLAN_BUSINESS } from '@automattic/calypso-products';
import { getCalypsoUrl } from '@automattic/calypso-url';
import { useDispatch, useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { FC, useCallback, useEffect } from 'react';
import { usePreviewingTheme } from './hooks/use-previewing-theme';
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
	previewingTheme: ReturnType< typeof usePreviewingTheme >;
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
			const noticeTextUpgrade = sprintf(
				// translators: %1$s: The previewing theme name, %2$s: The theme type ('Woo Commerce' or 'Premium'), %3$s: The required plan name ('Business' or 'Premium')
				__(
					'You are previewing %1$s, a %2$s theme. To unlock this theme upgrade to the %3$s plan.',
					'wpcom-live-preview'
				),
				previewingTheme.name,
				previewingTheme.typeDisplay,
				previewingTheme.requiredPlan
			);
			const noticeTextCustomize = __(
				'You can try out your own style customizations, which will only be saved if you activate this theme.',
				'wpcom-live-preview'
			);
			createWarningNotice( noticeTextUpgrade + '<br/>' + noticeTextCustomize, {
				id: UPGRADE_NOTICE_ID,
				isDismissible: false,
				__unstableHTML: true,
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
			} );
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
		previewingTheme.typeDisplay,
		previewingTheme.requiredPlan,
	] );
	return null;
};
