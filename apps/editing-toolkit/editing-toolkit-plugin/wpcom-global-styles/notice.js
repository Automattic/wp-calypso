/* global wpcomGlobalStyles */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useGlobalStylesConfig } from './use-global-styles-config';
import './notice.scss';

const NOTICE_ID = 'wpcom-global-styles/gating-notice';

const GlobalStylesNotice = () => {
	const { globalStylesInUse, globalStylesId } = useGlobalStylesConfig();
	const { isSiteEditor, isPostEditor } = useSelect(
		( select ) => ( {
			isSiteEditor: !! select( 'core/edit-site' ),
			isPostEditor: ! select( 'core/edit-site' ) && !! select( 'core/editor' ).getCurrentPostId(),
		} ),
		[]
	);

	const { createWarningNotice, removeNotice } = useDispatch( 'core/notices' );
	const { editEntityRecord } = useDispatch( 'core' );

	const trackEvent = useCallback(
		( eventName ) =>
			recordTracksEvent( eventName, {
				context: isSiteEditor ? 'site-editor' : 'post-editor',
				blog_id: wpcomGlobalStyles.wpcomBlogId,
			} ),
		[ isSiteEditor ]
	);

	const upgradePlan = useCallback( () => {
		window.open( wpcomGlobalStyles.upgradeUrl, '_blank' ).focus();
		trackEvent( 'calypso_global_styles_gating_notice_upgrade_click' );
	}, [ trackEvent ] );

	const previewSite = useCallback( () => {
		window.open( wpcomGlobalStyles.previewUrl, '_blank' ).focus();
		trackEvent( 'calypso_global_styles_gating_notice_preview_click' );
	}, [ trackEvent ] );

	const resetGlobalStyles = useCallback( () => {
		if ( ! globalStylesId ) {
			return;
		}

		editEntityRecord( 'root', 'globalStyles', globalStylesId, {
			styles: {},
			settings: {},
		} );

		trackEvent( 'calypso_global_styles_gating_notice_reset_click' );
	}, [ editEntityRecord, globalStylesId, trackEvent ] );

	const showNotice = useCallback( () => {
		const actions = [
			{
				label: __( 'Upgrade now', 'full-site-editing' ),
				onClick: upgradePlan,
				variant: 'primary',
				noDefaultClasses: true,
			},
		];

		if ( isPostEditor ) {
			actions.push( {
				label: __( 'Preview your site', 'full-site-editing' ),
				onClick: previewSite,
				variant: 'secondary',
				noDefaultClasses: true,
			} );
		}

		if ( isSiteEditor ) {
			actions.push( {
				label: __( 'Remove custom styles', 'full-site-editing' ),
				onClick: resetGlobalStyles,
				variant: 'link',
				noDefaultClasses: true,
			} );
		}

		createWarningNotice(
			__(
				'Your site includes customized styles that are only visible to visitors after upgrading to the Premium plan or higher.',
				'full-site-editing'
			),
			{
				id: NOTICE_ID,
				isDismissible: false,
				actions: actions,
			}
		);

		trackEvent( 'calypso_global_styles_gating_notice_show' );
	}, [
		createWarningNotice,
		isPostEditor,
		isSiteEditor,
		previewSite,
		resetGlobalStyles,
		trackEvent,
		upgradePlan,
	] );

	useEffect( () => {
		if ( ! isSiteEditor && ! isPostEditor ) {
			return;
		}

		if ( globalStylesInUse ) {
			showNotice();
		} else {
			removeNotice( NOTICE_ID );
		}

		return () => removeNotice( NOTICE_ID );
	}, [ globalStylesInUse, isSiteEditor, isPostEditor, removeNotice, showNotice ] );

	return null;
};

export default GlobalStylesNotice;
