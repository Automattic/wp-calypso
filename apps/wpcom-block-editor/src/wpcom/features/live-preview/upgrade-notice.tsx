import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { FC, useEffect } from 'react';
import { UPGRADE_NOTICE_ID } from './constants';
import { useHideTemplatePartHint } from './hooks/use-hide-template-part-hint';
import { usePreviewingTheme } from './hooks/use-previewing-theme';
import { useSidebarNotice } from './hooks/use-sidebar-notice';

declare global {
	interface Window {
		_currentSiteId: number;
	}
}

export const LivePreviewUpgradeNotice: FC< {
	dashboardLink?: string;
	previewingTheme: ReturnType< typeof usePreviewingTheme >;
} > = ( { dashboardLink, previewingTheme } ) => {
	const { createInfoNotice, removeNotice } = useDispatch( 'core/notices' );
	useHideTemplatePartHint();

	const noticeText = sprintf(
		// translators: %s: plan name (e.g. Starter, Explorer).
		__(
			'Get access to this theme, and a ton of other features, with a subscription to the %s plan.',
			'wpcom-live-preview'
		),
		previewingTheme.plan
	);

	/**
	 * Show the notice when the canvas mode is 'edit'.
	 */
	useEffect( () => {
		createInfoNotice( noticeText, {
			id: UPGRADE_NOTICE_ID,
			isDismissible: false,
			__unstableHTML: true,
			actions: [
				...( dashboardLink
					? [
							{
								label: __( 'Back to themes', 'wpcom-live-preview' ),
								url: dashboardLink,
								variant: 'secondary',
								className: 'wpcom-live-preview-action',
							},
					  ]
					: [] ),
			],
		} );
		return () => {
			removeNotice( UPGRADE_NOTICE_ID );
		};
	}, [ createInfoNotice, dashboardLink, noticeText, removeNotice ] );

	/**
	 * Show the notice when the canvas mode is 'view'.
	 */
	useSidebarNotice( {
		noticeProps: {
			status: 'info',
			isDismissible: false,
			children: noticeText,
		},
	} );

	return null;
};
