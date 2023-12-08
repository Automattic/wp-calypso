import { useDispatch, useSelect } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { __, sprintf } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { FC, useEffect } from 'react';
import { useCanPreviewButNeedUpgrade } from './hooks/use-can-preview-but-need-upgrade';
import { useHideTemplatePartHint } from './hooks/use-hide-template-part-hint';
import { usePreviewingTheme } from './hooks/use-previewing-theme';
import { LivePreviewUpgradeModal } from './upgrade-modal';
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
	dashboardLink?: string;
	previewingThemeName?: string;
} > = ( { dashboardLink, previewingThemeName } ) => {
	const { createWarningNotice, removeNotice } = useDispatch( 'core/notices' );

	useHideTemplatePartHint();

	useEffect( () => {
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
	}, [ dashboardLink, createWarningNotice, removeNotice, previewingThemeName ] );
	return null;
};

const LivePreviewNoticePlugin = () => {
	const siteEditorStore = useSelect( ( select ) => select( 'core/edit-site' ), [] );
	const previewingTheme = usePreviewingTheme();
	const { canPreviewButNeedUpgrade, upgradePlan } = useCanPreviewButNeedUpgrade( {
		previewingTheme,
	} );
	const dashboardLink = useSelect(
		( select ) =>
			unlock &&
			select( 'core/edit-site' ) &&
			unlock( siteEditorStore ).getSettings().__experimentalDashboardLink,
		[ siteEditorStore ]
	);

	// Do nothing in the Post Editor context.
	if ( ! siteEditorStore ) {
		return null;
	}
	// Do nothing if the user is NOT previewing a theme.
	if ( ! previewingTheme.name ) {
		return null;
	}

	if ( canPreviewButNeedUpgrade ) {
		return (
			<>
				<LivePreviewUpgradeModal { ...{ themeId: previewingTheme.id as string, upgradePlan } } />
				<LivePreviewUpgradeNotice { ...{ previewingTheme, upgradePlan, dashboardLink } } />
			</>
		);
	}
	return <LivePreviewNotice { ...{ dashboardLink, previewingThemeName: previewingTheme.name } } />;
};

const registerLivePreviewPlugin = () => {
	registerPlugin( 'wpcom-live-preview', {
		render: () => <LivePreviewNoticePlugin />,
	} );
};

domReady( () => {
	registerLivePreviewPlugin();
} );
