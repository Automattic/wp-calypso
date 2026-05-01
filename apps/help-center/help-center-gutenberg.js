/* global helpCenterData, __i18n_text_domain__ */
import './config';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import HelpCenter, { HelpIcon, LiveAIAssistant } from '@automattic/help-center';
import { localizeUrl } from '@automattic/i18n-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button, DropdownMenu, Fill } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/editor';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { comment, backup, page, video, rss } from '@wordpress/icons';
import { registerPlugin } from '@wordpress/plugins';
import ReactDOM from 'react-dom';
import { useCanvasMode } from './hooks/use-canvas-mode';
import { useMenuPanelExperiment } from './hooks/use-menu-panel-experiment';
import { getEditorType } from './utils';
import './help-center.scss';

const queryClient = new QueryClient();

const SMART_DICTATION_SIDEBAR_NAME = 'wpcom-smart-dictation';

const MicrophoneIcon = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="currentColor"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
		<path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
	</svg>
);

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

function JetpackSmartDictationPlugin() {
	return (
		<>
			<PluginSidebarMoreMenuItem target={ SMART_DICTATION_SIDEBAR_NAME } icon={ MicrophoneIcon }>
				{ __( 'WP.com Smart Dictation', __i18n_text_domain__ ) }
			</PluginSidebarMoreMenuItem>
			<PluginSidebar
				name={ SMART_DICTATION_SIDEBAR_NAME }
				title={ __( 'WP.com Smart Dictation', __i18n_text_domain__ ) }
				icon={ MicrophoneIcon }
			>
				<div className="wpcom-smart-dictation-sidebar-root">
					<QueryClientProvider client={ queryClient }>
						<LiveAIAssistant layout="sidebar" />
					</QueryClientProvider>
				</div>
			</PluginSidebar>
		</>
	);
}

registerPlugin( 'jetpack-live-ai-assistant', {
	icon: MicrophoneIcon,
	render: () => <JetpackSmartDictationPlugin />,
} );
