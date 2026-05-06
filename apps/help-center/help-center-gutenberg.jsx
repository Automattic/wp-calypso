/* global helpCenterData, __i18n_text_domain__ */
import './config';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import HelpCenter, { HelpIcon } from '@automattic/help-center';
import { localizeUrl } from '@automattic/i18n-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button, DropdownMenu, Fill } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { comment, backup, page, video, rss } from '@wordpress/icons';
import { registerPlugin } from '@wordpress/plugins';
import { useRef } from 'react';
import ReactDOM from 'react-dom';
import { useCanvasMode } from './hooks/use-canvas-mode';
import { useMenuPanelExperiment } from './hooks/use-menu-panel-experiment';
import { getEditorType } from './utils';
import './help-center.scss';

const queryClient = new QueryClient();

function HelpCenterContent() {
	const isDesktop = useMediaQuery( '(min-width: 480px)' );
	const [ showHelpIcon, setShowHelpIcon ] = useState( false );
	const [ helpCenterPage, setHelpCenterPage ] = useState( null );
	const { setShowHelpCenter, setNavigateToRoute } = useDispatch( 'automattic/help-center' );
	const { isInTreatment: isMenuPanelExperimentEnabled, isLoading: isLoadingExperimentAssignment } =
		useMenuPanelExperiment( 'calypso_help_center_menu_popover_increase_exposure', 'menu_popover' );
	const isShown = useSelect( ( s ) => s( 'automattic/help-center' ).isHelpCenterShown(), [] );

	const canvasMode = useCanvasMode();

	const trackIconInteraction = useCallback( () => {
		recordTracksEvent( 'wpcom_help_center_icon_interaction', {
			is_help_center_visible: isShown ?? false,
			section: helpCenterData.sectionName || 'wp-admin',
			is_menu_panel_enabled: isMenuPanelExperimentEnabled ?? false,
			is_assignment_loaded: ! isLoadingExperimentAssignment,
		} );
	}, [ isShown, isMenuPanelExperimentEnabled, isLoadingExperimentAssignment ] );

	const handleToggleHelpCenter = useCallback( () => {
		trackIconInteraction();
		recordTracksEvent( `calypso_inlinehelp_${ isShown ? 'close' : 'show' }`, {
			force_site_id: true,
			location: 'help-center',
			section: helpCenterData.sectionName || 'gutenberg-editor',
			editor_type: getEditorType(),
			canvas_mode: canvasMode,
		} );

		setShowHelpCenter( ! isShown );
	}, [ setShowHelpCenter, isShown, canvasMode, trackIconInteraction ] );

	const handleMenuClick = useCallback(
		( destination, isExternal = false ) => {
			recordTracksEvent( `calypso_dashboard_help_center_menu_panel_click`, {
				section: helpCenterData.sectionName || 'gutenberg',
				destination,
			} );

			if ( isExternal ) {
				return window.open( destination, '_blank', 'noopener,noreferrer' );
			}

			if ( isShown ) {
				if ( destination !== helpCenterPage ) {
					setNavigateToRoute( destination );
					setHelpCenterPage( destination );
				} else {
					recordTracksEvent( `calypso_inlinehelp_close`, {
						force_site_id: true,
						location: 'help-center',
						section: helpCenterData.sectionName || 'wp-admin',
					} );
					setShowHelpCenter( false );
					setHelpCenterPage( null );
				}
			} else {
				setNavigateToRoute( destination );
				setHelpCenterPage( destination );
				setShowHelpCenter( true );

				recordTracksEvent( `calypso_inlinehelp_show`, {
					force_site_id: true,
					location: 'help-center',
					section: helpCenterData.sectionName || 'wp-admin',
					destination,
				} );
			}
		},
		[ isShown, helpCenterPage, setNavigateToRoute, setHelpCenterPage, setShowHelpCenter ]
	);
	useEffect( () => {
		const timeout = setTimeout( () => setShowHelpIcon( true ), 0 );
		return () => clearTimeout( timeout );
	}, [] );

	const closeCallback = useCallback(
		() => setShowHelpCenter( false, undefined, true ),
		[ setShowHelpCenter ]
	);

	const sidebarActionsContainer = document.querySelector( '.edit-site-site-hub__actions' );

	const hasInitialized = useRef( false );
	// On mobile the SlotFill button is hidden by Gutenberg's own CSS, so wire up the
	// admin bar icon that our PHP adds for the gutenberg variant instead.
	const adminBarButton = document.getElementById( 'wp-admin-bar-help-center' );
	useEffect( () => {
		if ( isDesktop || ! adminBarButton ) {
			return;
		}
		adminBarButton.onclick = handleToggleHelpCenter;

		// make sure it's closed from the beginning
		if ( ! hasInitialized.current ) {
			hasInitialized.current = true;
			setShowHelpCenter( false );
		}

		// The help center panel uses --masterbar-height to position itself below the
		// top bars. In Gutenberg this variable is unset, so the panel defaults to
		// top:0 and the header is hidden behind the admin bar + editor toolbar.
		const adminBar = document.getElementById( 'wpadminbar' );
		const editorBar = document.querySelector( '.editor-header' );
		const combinedHeight = ( adminBar?.offsetHeight ?? 0 ) + ( editorBar?.offsetHeight ?? 0 );
		if ( combinedHeight > 0 ) {
			document.documentElement.style.setProperty( '--masterbar-height', combinedHeight + 'px' );
		}

		return () => {
			adminBarButton.onclick = null;
			document.documentElement.style.removeProperty( '--masterbar-height' );
		};
	}, [ isDesktop, adminBarButton, handleToggleHelpCenter, setShowHelpCenter ] );

	// On mobile, close the Help Center as soon as the user taps a button in
	// the editor header or the admin bar. The panel has a very high z-index
	// and sits below both; without this, Gutenberg popovers (block inserter,
	// document settings, publish, etc.) and admin-bar menus open behind the
	// panel and the tap looks silent. The admin bar's Help Center toggle is
	// excluded so its own open/close handler runs unimpeded.
	useEffect( () => {
		if ( isDesktop || ! isShown ) {
			return;
		}
		const editorBar = document.querySelector( '.editor-header' );
		const adminBar = document.getElementById( 'wpadminbar' );
		const closeOnDismissableTap = () => setShowHelpCenter( false );
		const closeOnAdminBarTap = ( event ) => {
			if ( event.target.closest( '#wp-admin-bar-help-center' ) ) {
				return;
			}
			setShowHelpCenter( false );
		};
		editorBar?.addEventListener( 'pointerdown', closeOnDismissableTap );
		adminBar?.addEventListener( 'pointerdown', closeOnAdminBarTap );
		return () => {
			editorBar?.removeEventListener( 'pointerdown', closeOnDismissableTap );
			adminBar?.removeEventListener( 'pointerdown', closeOnAdminBarTap );
		};
	}, [ isDesktop, isShown, setShowHelpCenter ] );

	// Menu items for the dropdown
	const menuControls = useMemo(
		() => [
			[
				{
					title: __( 'Chat support', __i18n_text_domain__ ),
					icon: comment,
					onClick: () => handleMenuClick( '/odie' ),
				},
				{
					title: __( 'Chat history', __i18n_text_domain__ ),
					icon: backup,
					onClick: () => handleMenuClick( '/chat-history' ),
				},
			],
			[
				{
					title: __( 'Support guides', __i18n_text_domain__ ),
					icon: page,
					onClick: () => handleMenuClick( '/support-guides' ),
				},
				...( ! helpCenterData.isCommerceGarden
					? [
							{
								title: __( 'Courses', __i18n_text_domain__ ),
								icon: video,
								onClick: () =>
									handleMenuClick( localizeUrl( 'https://wordpress.com/support/courses/' ), true ),
							},
							{
								title: __( 'Product updates', __i18n_text_domain__ ),
								icon: rss,
								onClick: () =>
									handleMenuClick(
										localizeUrl( 'https://wordpress.com/blog/category/product-features/' ),
										true
									),
							},
					  ]
					: [] ),
			],
		],
		[ handleMenuClick ]
	);

	const content = isMenuPanelExperimentEnabled ? (
		<DropdownMenu
			className={ [ 'entry-point-button', 'help-center', isShown ? 'is-active' : '' ].join( ' ' ) }
			icon={ <HelpIcon /> }
			label="Help"
			controls={ menuControls }
			popoverProps={ {
				position: 'bottom left',
			} }
			onToggle={ trackIconInteraction }
		/>
	) : (
		<Button
			className={ [ 'entry-point-button', 'help-center', isShown ? 'is-active' : '' ].join( ' ' ) }
			onClick={ handleToggleHelpCenter }
			icon={ <HelpIcon /> }
			label="Help"
			aria-pressed={ ( ! canvasMode || canvasMode === 'edit' ) && isShown ? true : false }
			aria-expanded={ isShown ? true : false }
			size={ ! canvasMode || canvasMode === 'edit' ? 'compact' : undefined }
		/>
	);

	const botProps = helpCenterData.isCommerceGarden
		? { newInteractionsBotSlug: 'ciab-workflow-support_chat' }
		: {};

	return (
		<>
			{ showHelpIcon &&
				canvasMode === 'view' &&
				sidebarActionsContainer &&
				ReactDOM.createPortal( content, sidebarActionsContainer ) }
			{ isDesktop && showHelpIcon && <Fill name="PinnedItems/core">{ content }</Fill> }
			<HelpCenter
				locale={ helpCenterData.locale }
				sectionName={ helpCenterData.sectionName || 'gutenberg-editor' }
				currentUser={ helpCenterData.currentUser }
				site={ helpCenterData.site }
				hasPurchases={ false }
				onboardingUrl="https://wordpress.com/start"
				handleClose={ closeCallback }
				product={ helpCenterData.isCommerceGarden ? 'commerce-garden' : undefined }
				{ ...botProps }
			/>
		</>
	);
}

function HelpCenterContentWithProvider() {
	return (
		<QueryClientProvider client={ queryClient }>
			<HelpCenterContent />
		</QueryClientProvider>
	);
}

registerPlugin( 'jetpack-help-center', {
	render: () => <HelpCenterContentWithProvider />,
} );
