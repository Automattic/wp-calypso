/* global helpCenterData, __i18n_text_domain__ */
import './config';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import HelpCenter, { HelpIcon } from '@automattic/help-center';
import { localizeUrl } from '@automattic/i18n-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button, DropdownMenu, Fill } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useDispatch, useSelect, dispatch, select } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { comment, backup, page, video, rss } from '@wordpress/icons';
import { registerPlugin } from '@wordpress/plugins';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { useCanvasMode } from './hooks/use-canvas-mode';
import { getEditorType } from './utils';
import './help-center.scss';

const queryClient = new QueryClient();

function HelpCenterContent() {
	const isDesktop = useMediaQuery( '(min-width: 480px)' );
	const [ showHelpIcon, setShowHelpIcon ] = useState( false );
	const [ helpCenterPage, setHelpCenterPage ] = useState( null );
	const { setShowHelpCenter, setNavigateToRoute } = useDispatch( 'automattic/help-center' );

	const isShown = useSelect( ( s ) => s( 'automattic/help-center' ).isHelpCenterShown(), [] );

	const canvasMode = useCanvasMode();

	// Check if the new menu panel feature is enabled
	const urlParams = new URLSearchParams( window.location.search );
	const hasHelpCenterMenuPanel = urlParams.get( 'flags' ) === 'help-center-menu-panel';

	const trackIconInteraction = useCallback( () => {
		recordTracksEvent( 'wpcom_help_center_icon_interaction', {
			is_help_center_visible: isShown,
			section: helpCenterData.sectionName || 'wp-admin',
			is_menu_panel_enabled: hasHelpCenterMenuPanel,
		} );
	}, [ isShown, hasHelpCenterMenuPanel ] );

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
			],
		],
		[ handleMenuClick ]
	);

	const content = hasHelpCenterMenuPanel ? (
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
				isCommerceGarden={ helpCenterData.isCommerceGarden }
				{ ...botProps }
			/>
		</>
	);
}

if ( helpCenterData.isNextAdmin ) {
	domReady( () => {
		dispatch( 'next-admin' ).unregisterSiteHubHelpMenuItem( 'wp-logo-external' );
		dispatch( 'next-admin' ).registerSiteHubHelpMenuItem( 'wp-logo' );
		dispatch( 'next-admin' ).registerSiteHubHelpMenuItem( 'help-center', {
			label: __( 'Help Center', __i18n_text_domain__ ),
			parent: 'wp-logo',
			callback: () => {
				const state = select( 'automattic/help-center' ).isHelpCenterShown();
				dispatch( 'automattic/help-center' ).setShowHelpCenter( ! state );
			},
		} );
		const container = document.createElement( 'div' );
		container.id = 'jetpack-help-center';
		document.body.appendChild( container );
		const botProps = helpCenterData.isCommerceGarden
			? { newInteractionsBotSlug: 'ciab-workflow-support_chat' }
			: {};

		createRoot( container ).render(
			<QueryClientProvider client={ queryClient }>
				<HelpCenter
					locale={ helpCenterData.locale }
					sectionName={ helpCenterData.sectionName || 'gutenberg-editor' }
					currentUser={ helpCenterData.currentUser }
					site={ helpCenterData.site }
					hasPurchases={ false }
					onboardingUrl="https://wordpress.com/start"
					handleClose={ () => dispatch( 'automattic/help-center' ).setShowHelpCenter( false ) }
					isCommerceGarden={ helpCenterData.isCommerceGarden }
					{ ...botProps }
				/>
			</QueryClientProvider>,
			document.getElementById( 'jetpack-help-center' )
		);
	} );
} else {
	registerPlugin( 'jetpack-help-center', {
		render: () => {
			return (
				<QueryClientProvider client={ queryClient }>
					<HelpCenterContent />
				</QueryClientProvider>
			);
		},
	} );
}
