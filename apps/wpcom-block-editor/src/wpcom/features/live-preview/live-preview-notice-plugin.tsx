import { useDispatch, useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { FC, useEffect } from 'react';
import { getUnlock } from '../../utils';
import { NOTICE_ID } from './constants';
import { useCanPreviewButNeedUpgrade } from './hooks/use-can-preview-but-need-upgrade';
import { useHideTemplatePartHint } from './hooks/use-hide-template-part-hint';
import { usePreviewingTheme } from './hooks/use-previewing-theme';
import { LivePreviewUpgradeButton } from './upgrade-button';
import { LivePreviewUpgradeNotice } from './upgrade-notice';

const unlock = getUnlock();

/**
 * This is an interim solution to clarify to users that they are currently live previewing a theme.
 * And this should be moved to jetpack-mu-wpcom.
 * @see https://github.com/Automattic/wp-calypso/issues/82218
 */
const LivePreviewNotice: FC< {
	dashboardLink?: string;
	previewingThemeName?: string;
} > = ( { dashboardLink, previewingThemeName } ) => {
	const { createInfoNotice, removeNotice } = useDispatch( 'core/notices' );

	useHideTemplatePartHint();

	useEffect( () => {
		createInfoNotice(
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
						className: 'wpcom-live-preview-action',
					},
				],
			}
		);
		return () => removeNotice( NOTICE_ID );
	}, [ dashboardLink, createInfoNotice, removeNotice, previewingThemeName ] );
	return null;
};

const LivePreviewNoticePlugin = () => {
	const isReady = useSelect( ( select ) => select( 'core/editor' ).__unstableIsEditorReady() );
	const siteEditorStore = useSelect( ( select ) => select( 'core/edit-site' ), [] );
	const previewingTheme = usePreviewingTheme();
	const { canPreviewButNeedUpgrade, upgradePlan } = useCanPreviewButNeedUpgrade( previewingTheme );
	const dashboardLink = useSelect(
		( select ) =>
			unlock &&
			select( 'core/edit-site' ) &&
			unlock( siteEditorStore ).getSettings().__experimentalDashboardLink,
		[ siteEditorStore ]
	);

	// Do nothing if the user is NOT previewing a theme.
	if ( ! previewingTheme.name ) {
		return null;
	}

	if ( canPreviewButNeedUpgrade ) {
		return (
			<>
				{ isReady && <LivePreviewUpgradeButton { ...{ previewingTheme, upgradePlan } } /> }
				<LivePreviewUpgradeNotice { ...{ previewingTheme, dashboardLink } } />
			</>
		);
	}
	return <LivePreviewNotice { ...{ dashboardLink, previewingThemeName: previewingTheme.name } } />;
};

export default LivePreviewNoticePlugin;
