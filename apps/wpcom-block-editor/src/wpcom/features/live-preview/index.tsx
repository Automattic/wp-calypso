import { useDispatch, useSelect } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { __, sprintf } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { FC, useEffect } from 'react';
import { useCanPreviewButNeedUpgrade } from './hooks/use-can-preview-but-need-upgrade';
import { usePreviewingTheme } from './hooks/use-previewing-theme';
import { LivePreviewUpgradeNotice } from './upgrade-notice';
import { getUnlock } from './utils';

const unlock = getUnlock();

const NOTICE_ID = 'wpcom-live-preview/notice';

/**
 * This is an interim solution to clarify to users that they are currently live previewing a theme.
 * And this should be moved to jetpack-mu-wpcom.
 * @see https://github.com/Automattic/wp-calypso/issues/82218
 */
const LivePreviewNotice: FC< {
	previewingThemeName?: string;
} > = ( { previewingThemeName } ) => {
	const { createWarningNotice, removeNotice } = useDispatch( 'core/notices' );
	const { set: setPreferences } = useDispatch( 'core/preferences' );

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
		if ( ! previewingThemeName ) {
			removeNotice( NOTICE_ID );
			return;
		}

		// Suppress the "Looking for template parts?" notice in the Site Editor sidebar.
		// The preference name is defined in https://github.com/WordPress/gutenberg/blob/d47419499cd58e20db25c370cdbf02ddf7cffce0/packages/edit-site/src/components/sidebar-navigation-screen-main/template-part-hint.js#L9.
		setPreferences( 'core', 'isTemplatePartMoveHintVisible', false );

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
		setPreferences,
		createWarningNotice,
		removeNotice,
		previewingThemeName,
	] );
	return null;
};

const LivePreviewNoticePlugin = () => {
	const previewingTheme = usePreviewingTheme();
	const { canPreviewButNeedUpgrade, upgradePlan } = useCanPreviewButNeedUpgrade( {
		previewingTheme,
	} );
	if ( canPreviewButNeedUpgrade ) {
		return <LivePreviewUpgradeNotice { ...{ previewingTheme, upgradePlan } } />;
	}
	return <LivePreviewNotice { ...{ previewingThemeName: previewingTheme.name } } />;
};

const registerLivePreviewPlugin = () => {
	registerPlugin( 'wpcom-live-preview', {
		render: () => <LivePreviewNoticePlugin />,
	} );
};

domReady( () => {
	registerLivePreviewPlugin();
} );
