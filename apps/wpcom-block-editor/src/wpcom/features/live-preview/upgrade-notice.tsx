import { useDispatch, useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { FC, useEffect } from 'react';
import { usePreviewingTheme } from './hooks/use-previewing-theme';
import { getUnlock, isPreviewingTheme } from './utils';

declare global {
	interface Window {
		_currentSiteId: number;
	}
}

const UPGRADE_NOTICE_ID = 'wpcom-live-preview/notice/upgrade';

const unlock = getUnlock();

export const LivePreviewUpgradeNotice: FC< {
	previewingTheme: ReturnType< typeof usePreviewingTheme >;
	upgradePlan: () => void;
} > = ( { previewingTheme, upgradePlan } ) => {
	const siteEditorStore = useSelect( ( select ) => select( 'core/edit-site' ), [] );
	const { createWarningNotice, removeNotice } = useDispatch( 'core/notices' );

	const dashboardLink =
		unlock &&
		siteEditorStore &&
		unlock( siteEditorStore ).getSettings().__experimentalDashboardLink;

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

		const noticeText = sprintf(
			// translators: %1$s: The previewing theme name, %2$s: The theme type ('WooCommerce' or 'Premium')
			__(
				'You are previewing %1$s, a %2$s theme. You can try out your own style customizations, which will only be saved if you upgrade and activate this theme.',
				'wpcom-live-preview'
			),
			previewingTheme.name,
			previewingTheme.typeDisplay
		);
		createWarningNotice( noticeText, {
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
		return () => removeNotice( UPGRADE_NOTICE_ID );
	}, [
		createWarningNotice,
		removeNotice,
		siteEditorStore,
		upgradePlan,
		previewingTheme.type,
		previewingTheme.name,
		dashboardLink,
		previewingTheme.typeDisplay,
	] );
	return null;
};
