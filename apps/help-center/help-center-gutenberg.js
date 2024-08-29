/* global helpCenterData */
import './config';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import HelpCenter, { HelpIcon } from '@automattic/help-center';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button, Fill } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useState, useReducer } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useCanvasMode } from './hooks';
// Remove me once jetpack#38935 is deployed.
import './help-button.scss';

const queryClient = new QueryClient();

function HelpCenterContent() {
	const { isRTL } = useI18n();

	const cssUrl = `https://widgets.wp.com/help-center/help-center-wp-admin${
		isRTL() ? '.rtl' : ''
	}.css`;

	const wpComponentsCssUrl = `https://widgets.wp.com/help-center/wp-components-styles${
		isRTL() ? '.rtl' : ''
	}.css`;

	const cssUrls = useMemo( () => [ cssUrl, wpComponentsCssUrl ], [ cssUrl, wpComponentsCssUrl ] );

	const [ , forceUpdate ] = useReducer( ( x ) => x + 1, 0 );
	const isDesktop = useMediaQuery( '(min-width: 480px)' );
	const [ showHelpIcon, setShowHelpIcon ] = useState( false );
	const { setShowHelpCenter } = useDispatch( 'automattic/help-center' );

	const show = useSelect( ( select ) => select( 'automattic/help-center' ).isHelpCenterShown() );

	const canvasMode = useCanvasMode();

	const handleToggleHelpCenter = useCallback( () => {
		recordTracksEvent( `calypso_inlinehelp_${ show ? 'close' : 'show' }`, {
			force_site_id: true,
			location: 'help-center',
			section: 'gutenberg-editor',
			canvas_mode: canvasMode,
		} );

		setShowHelpCenter( ! show );
	}, [ setShowHelpCenter, show, canvasMode ] );

	useEffect( () => {
		const timeout = setTimeout( () => setShowHelpIcon( true ), 0 );
		return () => clearTimeout( timeout );
	}, [] );

	useEffect( () => {
		// Close the Help Center when the canvas mode changes.
		setShowHelpCenter( false );

		// Force to re-render to ensure the sidebar is available.
		if ( canvasMode === 'view' ) {
			forceUpdate();
		}
	}, [ canvasMode ] );

	const closeCallback = useCallback( () => setShowHelpCenter( false ), [ setShowHelpCenter ] );

	const sidebarActionsContainer = document.querySelector( '.edit-site-site-hub__actions' );

	const content = (
		<>
			<Button
				className={ [ 'entry-point-button', 'help-center', show ? 'is-active' : '' ].join( ' ' ) }
				onClick={ handleToggleHelpCenter }
				icon={ <HelpIcon /> }
				label="Help"
				aria-pressed={ canvasMode === 'edit' && show ? true : false }
				aria-expanded={ show ? true : false }
				size={ canvasMode === 'edit' ? 'compact' : undefined }
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
				sectionName="gutenberg-editor"
				currentUser={ helpCenterData.currentUser }
				site={ helpCenterData.site }
				hasPurchases={ false }
				onboardingUrl="https://wordpress.com/start"
				handleClose={ closeCallback }
				shadowCSSFromUrls={ cssUrls }
			/>
		</>
	);
}

registerPlugin( 'jetpack-help-center', {
	render: () => {
		return (
			<QueryClientProvider client={ queryClient }>
				<HelpCenterContent />
			</QueryClientProvider>
		);
	},
} );
