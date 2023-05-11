/* global wpcomGlobalStyles */
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import './notice.scss';
import { recordUpgradeNoticeShow, recordUpgradeNoticeClick } from './tracks-events';
import { useGlobalStylesConfig } from './use-global-styles-config';

const GlobalStylesNotice = () => {
	const { globalStylesInUse, globalStylesId } = useGlobalStylesConfig();
	const editor = useSelect( ( select ) => {
		if ( select( 'core/edit-site' ) ) {
			return 'site-editor';
		}

		if ( select( 'core/edit-post' ) ) {
			return 'post-editor';
		}

		return undefined;
	}, [] );
	const { createWarningNotice, removeNotice } = useDispatch( 'core/notices' );
	const { editEntityRecord } = useDispatch( 'core' );

	const resetGlobalStyles = () => {
		if ( ! globalStylesId ) {
			return;
		}

		editEntityRecord( 'root', 'globalStyles', globalStylesId, {
			styles: {},
			settings: {},
		} );
	};

	useEffect( () => {
		if ( globalStylesInUse ) {
			recordUpgradeNoticeShow( editor );
			createWarningNotice(
				__(
					'Your site includes customized styles that are only visible to visitors after upgrading to the Premium plan or higher.',
					'full-site-editing'
				),
				{
					id: 'wpcom-global-styles/gating-notice',
					isDismissible: false,
					actions: [
						{
							url: wpcomGlobalStyles.upgradeUrl,
							label: __( 'Upgrade now', 'full-site-editing' ),
							onClick: () => recordUpgradeNoticeClick( editor ),
							variant: 'primary',
							noDefaultClasses: true,
						},
						...( editor === 'post-editor'
							? [
									{
										url: wpcomGlobalStyles.previewUrl,
										label: __( 'Preview your site', 'full-site-editing' ),
										variant: 'secondary',
										noDefaultClasses: true,
									},
							  ]
							: [] ),
						...( editor === 'site-editor'
							? [
									{
										label: __( 'Remove custom styles', 'full-site-editing' ),
										onClick: resetGlobalStyles,
										variant: 'link',
										noDefaultClasses: true,
									},
							  ]
							: [] ),
					],
				}
			);
		} else {
			removeNotice( 'wpcom-global-styles/gating-notice' );
		}
	}, [ globalStylesInUse, editor, createWarningNotice, removeNotice, resetGlobalStyles ] );

	return null;
};

export default GlobalStylesNotice;
