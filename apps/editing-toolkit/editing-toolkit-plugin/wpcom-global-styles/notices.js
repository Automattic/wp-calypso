/* global wpcomGlobalStyles */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { ExternalLink, Notice } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import {
	createInterpolateElement,
	render,
	useCallback,
	useEffect,
	useState,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useCanvas } from './use-canvas';
import { useGlobalStylesConfig } from './use-global-styles-config';
import { usePreview } from './use-preview';
import './notice.scss';

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

	const upgradeTranslation = __(
		'Your site includes premium styles that are only visible to visitors after <a>upgrading to the Premium plan or higher</a>.',
		'full-site-editing'
	);

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

	const [ isRendered, setIsRendered ] = useState( false );

	useEffect( () => {
		if ( isRendered || canvas !== 'view' ) {
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

		setIsRendered( true );
	}, [ isRendered, canvas ] );

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
				label: __( 'Preview without premium styles', 'full-site-editing' ),
				onClick: previewPost,
				variant: 'secondary',
				noDefaultClasses: true,
				className: 'wpcom-global-styles-action-has-icon wpcom-global-styles-action-is-external',
			} );
		}

		actions.push( {
			label: __( 'Remove premium styles', 'full-site-editing' ),
			onClick: isSiteEditor ? resetGlobalStyles : openResetGlobalStylesSupport,
			variant: isSiteEditor ? 'secondary' : 'link',
			noDefaultClasses: true,
			className: isSiteEditor
				? ''
				: 'wpcom-global-styles-action-has-icon wpcom-global-styles-action-is-external wpcom-global-styles-action-is-support',
		} );

		createWarningNotice(
			__(
				'Your site includes premium styles that are only visible to visitors after upgrading to the Premium plan or higher.',
				'full-site-editing'
			),
			{
				id: NOTICE_ID,
				actions: actions,
			}
		);

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
