/* global wpcomGlobalStyles */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { ExternalLink, Notice } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement, render, useCallback, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useCanvas } from './use-canvas';
import { useGlobalStylesConfig } from './use-global-styles-config';
import { usePreview } from './use-preview';
import './notice.scss';

const GLOBAL_STYLES_TREATMENT_GROUP = '1';

const trackEvent = ( eventName, isSiteEditor = true ) =>
	recordTracksEvent( eventName, {
		context: isSiteEditor ? 'site-editor' : 'post-editor',
		blog_id: wpcomGlobalStyles.wpcomBlogId,
	} );

function GlobalStylesWarningNotice() {
	const { globalStylesInUse } = useGlobalStylesConfig();

	useEffect( () => {
		if ( globalStylesInUse ) {
			trackEvent( 'calypso_global_styles_gating_notice_view_canvas_show' );
		}
	}, [ globalStylesInUse ] );

	if ( ! globalStylesInUse ) {
		return null;
	}

	let upgradeTranslation;
	if ( wpcomGlobalStyles?.globalStylesInPersonalPlan === GLOBAL_STYLES_TREATMENT_GROUP ) {
		upgradeTranslation = __(
			'Your site includes customized styles that are only visible to visitors after <a>upgrading to the Personal plan or higher</a>.',
			'full-site-editing'
		);
	} else {
		upgradeTranslation = __(
			'Your site includes customized styles that are only visible to visitors after <a>upgrading to the Premium plan or higher</a>.',
			'full-site-editing'
		);
	}

	return (
		<Notice status="warning" isDismissible={ false } className="wpcom-global-styles-notice">
			{ createInterpolateElement( upgradeTranslation, {
				a: (
					<ExternalLink
						href={ wpcomGlobalStyles.upgradeUrl }
						target="_blank"
						onClick={ () =>
							trackEvent( 'calypso_global_styles_gating_notice_view_canvas_upgrade_click' )
						}
					/>
				),
			} ) }
		</Notice>
	);
}

function GlobalStylesViewNotice() {
	const { canvas } = useCanvas();

	useEffect( () => {
		if ( canvas !== 'view' ) {
			return;
		}

		const saveHub = document.querySelector( '.edit-site-save-hub' );
		if ( ! saveHub ) {
			return;
		}

		// Insert the notice as a sibling of the save hub instead of as a child,
		// to prevent our notice from breaking the flex styles of the hub.
		const container = saveHub.parentNode;
		const noticeContainer = document.createElement( 'div' );
		noticeContainer.classList.add( 'wpcom-global-styles-notice-container' );
		container.insertBefore( noticeContainer, saveHub );

		render( <GlobalStylesWarningNotice />, noticeContainer );
	}, [ canvas ] );

	return null;
}

function GlobalStylesEditNotice() {
	const NOTICE_ID = 'wpcom-global-styles/gating-notice';
	const { globalStylesInUse, globalStylesId } = useGlobalStylesConfig();
	const { canvas } = useCanvas();
	const { isSiteEditor, isPostEditor } = useSelect(
		( select ) => ( {
			isSiteEditor: !! select( 'core/edit-site' ) && canvas === 'edit',
			isPostEditor: ! select( 'core/edit-site' ) && !! select( 'core/editor' ).getCurrentPostId(),
		} ),
		[ canvas ]
	);
	const { previewPostWithoutCustomStyles, canPreviewPost } = usePreview();

	const { createWarningNotice, removeNotice } = useDispatch( 'core/notices' );
	const { editEntityRecord } = useDispatch( 'core' );

	const upgradePlan = useCallback( () => {
		window.open( wpcomGlobalStyles.upgradeUrl, '_blank' ).focus();
		trackEvent( 'calypso_global_styles_gating_notice_upgrade_click', isSiteEditor );
	}, [ isSiteEditor ] );

	const previewPost = useCallback( () => {
		previewPostWithoutCustomStyles();
		trackEvent( 'calypso_global_styles_gating_notice_preview_click', isSiteEditor );
	}, [ isSiteEditor, previewPostWithoutCustomStyles ] );

	const resetGlobalStyles = useCallback( () => {
		if ( ! globalStylesId ) {
			return;
		}

		editEntityRecord( 'root', 'globalStyles', globalStylesId, {
			styles: {},
			settings: {},
		} );

		trackEvent( 'calypso_global_styles_gating_notice_reset_click', isSiteEditor );
	}, [ editEntityRecord, globalStylesId, isSiteEditor ] );

	const openResetGlobalStylesSupport = useCallback( () => {
		window.open( wpcomGlobalStyles.resetGlobalStylesSupportUrl, '_blank' ).focus();
		trackEvent( 'calypso_global_styles_gating_notice_reset_support_click', isSiteEditor );
	}, [ isSiteEditor ] );

	const showNotice = useCallback( () => {
		const actions = [
			{
				label: __( 'Upgrade now', 'full-site-editing' ),
				onClick: upgradePlan,
				variant: 'primary',
				noDefaultClasses: true,
				className: 'wpcom-global-styles-action-has-icon wpcom-global-styles-action-is-external',
			},
		];

		if ( isPostEditor && canPreviewPost ) {
			actions.push( {
				label: __( 'Preview without custom styles', 'full-site-editing' ),
				onClick: previewPost,
				variant: 'secondary',
				noDefaultClasses: true,
				className: 'wpcom-global-styles-action-has-icon wpcom-global-styles-action-is-external',
			} );
		}

		actions.push( {
			label: __( 'Remove custom styles', 'full-site-editing' ),
			onClick: isSiteEditor ? resetGlobalStyles : openResetGlobalStylesSupport,
			variant: isSiteEditor ? 'secondary' : 'link',
			noDefaultClasses: true,
			className: isSiteEditor
				? ''
				: 'wpcom-global-styles-action-has-icon wpcom-global-styles-action-is-external wpcom-global-styles-action-is-support',
		} );

		if ( wpcomGlobalStyles?.globalStylesInPersonalPlan === GLOBAL_STYLES_TREATMENT_GROUP ) {
			createWarningNotice(
				__(
					'Your site includes customized styles that are only visible to visitors after upgrading to the Personal plan or higher.',
					'full-site-editing'
				),
				{
					id: NOTICE_ID,
					actions: actions,
				}
			);
		} else {
			createWarningNotice(
				__(
					'Your site includes customized styles that are only visible to visitors after upgrading to the Premium plan or higher.',
					'full-site-editing'
				),
				{
					id: NOTICE_ID,
					actions: actions,
				}
			);
		}

		trackEvent( 'calypso_global_styles_gating_notice_show', isSiteEditor );
	}, [
		canPreviewPost,
		createWarningNotice,
		isPostEditor,
		isSiteEditor,
		openResetGlobalStylesSupport,
		previewPost,
		resetGlobalStyles,
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
}

export default function GlobalStylesNotices() {
	return (
		<>
			<GlobalStylesViewNotice />
			<GlobalStylesEditNotice />
		</>
	);
}
