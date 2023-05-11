/* global wpcomGlobalStyles */
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import './notice.scss';
import { recordUpgradeNoticeShow, recordUpgradeNoticeClick } from './tracks-events';
import { useGlobalStylesConfig } from './use-global-styles-config';

const GlobalStylesNotice = () => {
	const { globalStylesInUse, globalStylesId } = useGlobalStylesConfig();
	const { isSiteEditor, isPostEditor } = useSelect(
		( select ) => ( {
			isSiteEditor: !! select( 'core/edit-site' ),
			isPostEditor: !! select( 'core/edit-post' ),
		} ),
		[]
	);
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
		if ( ! isSiteEditor && ! isPostEditor ) {
			return;
		}

		if ( globalStylesInUse ) {
			recordUpgradeNoticeShow( isSiteEditor ? 'site-editor' : 'post-editor' );
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
							onClick: () =>
								recordUpgradeNoticeClick( isSiteEditor ? 'site-editor' : 'post-editor' ),
							variant: 'primary',
							noDefaultClasses: true,
						},
						...( isPostEditor
							? [
									{
										url: wpcomGlobalStyles.previewUrl,
										label: __( 'Preview your site', 'full-site-editing' ),
										variant: 'secondary',
										noDefaultClasses: true,
									},
							  ]
							: [] ),
						...( isSiteEditor
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
	}, [
		globalStylesInUse,
		isSiteEditor,
		isPostEditor,
		createWarningNotice,
		removeNotice,
		resetGlobalStyles,
	] );

	return null;
};

export default GlobalStylesNotice;
