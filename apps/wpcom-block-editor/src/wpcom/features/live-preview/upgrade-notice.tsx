import { Notice } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { render } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { FC, useEffect, useState } from 'react';
import { useHideTemplatePartHint } from './hooks/use-hide-template-part-hint';
import { usePreviewingTheme } from './hooks/use-previewing-theme';
import { getUnlock } from './utils';

declare global {
	interface Window {
		_currentSiteId: number;
	}
}

const LIVE_PREVIEW_UPGRADE_NOTICE_VIEW_SELECTOR =
	'wpcom-live-preview-upgrade-notice-view-container';
const UPGRADE_NOTICE_ID = 'wpcom-live-preview/notice/upgrade';

const unlock = getUnlock();

const LivePreviewUpgradeNoticeView: FC< {
	noticeText: string;
	upgradePlan: () => void;
} > = ( { noticeText, upgradePlan } ) => {
	return (
		<Notice
			status="warning"
			isDismissible={ false }
			className="wpcom-live-preview-upgrade-notice-view"
			actions={ [
				{
					// TODO: Add the tracking event.
					label: __( 'Upgrade now', 'wpcom-live-preview' ),
					onClick: upgradePlan,
					variant: 'primary',
				},
			] }
		>
			{ noticeText }
		</Notice>
	);
};

export const LivePreviewUpgradeNotice: FC< {
	dashboardLink?: string;
	previewingTheme: ReturnType< typeof usePreviewingTheme >;
	upgradePlan: () => void;
} > = ( { dashboardLink, previewingTheme, upgradePlan } ) => {
	const [ isRendered, setIsRendered ] = useState( false );
	const { createWarningNotice } = useDispatch( 'core/notices' );
	const canvasMode = useSelect(
		( select ) =>
			unlock && select( 'core/edit-site' ) && unlock( select( 'core/edit-site' ) ).getCanvasMode(),
		[]
	);
	useHideTemplatePartHint();

	const noticeText = sprintf(
		// translators: %1$s: The previewing theme name, %2$s: The theme type ('WooCommerce' or 'Premium')
		__(
			'You are previewing %1$s, a %2$s theme. You can try out your own style customizations, which will only be saved if you upgrade and activate this theme.',
			'wpcom-live-preview'
		),
		previewingTheme.name,
		previewingTheme.typeDisplay
	);

	/**
	 * Show the notice when the canvas mode is 'edit'.
	 */
	useEffect( () => {
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
	}, [ createWarningNotice, dashboardLink, noticeText, upgradePlan ] );

	/**
	 * Show the notice when the canvas mode is 'view'.
	 */
	useEffect( () => {
		if ( canvasMode !== 'view' ) {
			return;
		}
		if ( isRendered ) {
			return;
		}

		const SAVE_HUB_SELECTOR = '.edit-site-save-hub';
		const saveHub = document.querySelector( SAVE_HUB_SELECTOR );
		if ( ! saveHub ) {
			return;
		}

		// Insert the notice as a sibling of the save hub instead of as a child,
		// to prevent our notice from breaking the flex styles of the hub.
		const container = saveHub.parentNode;
		const noticeContainer = document.createElement( 'div' );
		noticeContainer.classList.add( LIVE_PREVIEW_UPGRADE_NOTICE_VIEW_SELECTOR );
		if ( container ) {
			container.insertBefore( noticeContainer, saveHub );
		}

		render(
			<LivePreviewUpgradeNoticeView noticeText={ noticeText } upgradePlan={ upgradePlan } />,
			noticeContainer
		);

		setIsRendered( true );
	}, [ canvasMode, isRendered, noticeText, upgradePlan ] );

	return null;
};
