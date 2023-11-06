import { useDispatch, useSelect } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { __, sprintf } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { FC, useEffect } from 'react';
import { useCanPreviewButNeedUpgrade } from './hooks/use-can-preview-but-need-upgrade';
import { usePreviewingTheme } from './hooks/use-previewing-theme';
import { LivePreviewUpgradeNotice } from './upgrade-notice';
import { getUnlock, isPreviewingTheme } from './utils';

const unlock = getUnlock();

const NOTICE_ID = 'wpcom-live-preview/notice';

/**
 * This is an interim solution to clarify to users that they are currently live previewing a theme.
 * And this should be moved to jetpack-mu-wpcom.
 * @see https://github.com/Automattic/wp-calypso/issues/82218
 */
const LivePreviewNotice: FC< {
	canPreviewButNeedUpgrade: boolean;
	previewingThemeName: string;
} > = ( { canPreviewButNeedUpgrade, previewingThemeName } ) => {
	const { createWarningNotice, removeNotice } = useDispatch( 'core/notices' );

	const siteEditorStore = useSelect( ( select ) => select( 'core/edit-site' ), [] );
	const dashboardLink =
		unlock &&
		siteEditorStore &&
		unlock( siteEditorStore ).getSettings().__experimentalDashboardLink;

	useEffect( () => {
		// Do nothing in the Post Editor context.
		if ( ! siteEditorStore ) {
			return;
		}
		if ( ! isPreviewingTheme() ) {
			removeNotice( NOTICE_ID );
			return;
		}
		// Avoid showing the redundant notice.
		if ( canPreviewButNeedUpgrade ) {
			return;
		}
		createWarningNotice(
			sprintf(
				// translators: %s: theme name
				__(
					'You are previewing the %s theme. You can try out your own style customizations, which will only be saved if you activate this theme.',
					'wpcom-live-preview'
				),
				previewingThemeName
			),
			{
				id: NOTICE_ID,
				isDismissible: false,
				actions: dashboardLink && [
					{
						label: __( 'Back to themes', 'wpcom-live-preview' ),
						url: dashboardLink,
						variant: 'secondary',
					},
				],
			}
		);
		return () => removeNotice( NOTICE_ID );
	}, [
		siteEditorStore,
		dashboardLink,
		createWarningNotice,
		removeNotice,
		previewingThemeName,
		canPreviewButNeedUpgrade,
	] );
	return null;
};

const LivePreviewNoticePlugin = () => {
	const previewingTheme = usePreviewingTheme();
	const { canPreviewButNeedUpgrade } = useCanPreviewButNeedUpgrade( {
		previewingThemeType: previewingTheme?.type,
	} );
	return (
		<>
			<LivePreviewNotice
				{ ...{ canPreviewButNeedUpgrade, previewingThemeName: previewingTheme.name } }
			/>
			<LivePreviewUpgradeNotice { ...{ canPreviewButNeedUpgrade, previewingTheme } } />
		</>
	);
};

const registerLivePreviewPlugin = () => {
	registerPlugin( 'wpcom-live-preview', {
		render: () => <LivePreviewNoticePlugin />,
	} );
};

domReady( () => {
	registerLivePreviewPlugin();
} );
