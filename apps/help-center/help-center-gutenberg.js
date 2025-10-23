/* global helpCenterData, __i18n_text_domain__ */
import './config';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import HelpCenter, { HelpIcon } from '@automattic/help-center';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button, Fill } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useDispatch, useSelect, dispatch, select } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
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
	const { setShowHelpCenter } = useDispatch( 'automattic/help-center' );

	const show = useSelect( ( s ) => s( 'automattic/help-center' ).isHelpCenterShown() );

	const canvasMode = useCanvasMode();

	const handleToggleHelpCenter = useCallback( () => {
		recordTracksEvent( `calypso_inlinehelp_${ show ? 'close' : 'show' }`, {
			force_site_id: true,
			location: 'help-center',
			section: helpCenterData.sectionName || 'gutenberg-editor',
			editor_type: getEditorType(),
			canvas_mode: canvasMode,
		} );

		setShowHelpCenter( ! show );
	}, [ setShowHelpCenter, show, canvasMode ] );

	useEffect( () => {
		const timeout = setTimeout( () => setShowHelpIcon( true ), 0 );
		return () => clearTimeout( timeout );
	}, [] );

	const closeCallback = useCallback(
		() => setShowHelpCenter( false, undefined, true ),
		[ setShowHelpCenter ]
	);

	const sidebarActionsContainer = document.querySelector( '.edit-site-site-hub__actions' );

	const content = (
		<>
			<Button
				className={ [ 'entry-point-button', 'help-center', show ? 'is-active' : '' ].join( ' ' ) }
				onClick={ handleToggleHelpCenter }
				icon={ <HelpIcon /> }
				label="Help"
				aria-pressed={ ( ! canvasMode || canvasMode === 'edit' ) && show ? true : false }
				aria-expanded={ show ? true : false }
				size={ ! canvasMode || canvasMode === 'edit' ? 'compact' : undefined }
			/>
		</>
	);

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
