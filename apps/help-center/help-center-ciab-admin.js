/* global helpCenterData */
import './config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { dispatch, select, subscribe } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { createRoot } from 'react-dom/client';
import './help-center.scss';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

function useCurrentRoute() {
	const [ route, setRoute ] = useState(
		() => window.location.pathname + window.location.search + window.location.hash
	);

	useEffect( () => {
		const updateRoute = () => {
			setRoute( window.location.pathname + window.location.search + window.location.hash );
		};

		const originalPushState = window.history.pushState;
		const originalReplaceState = window.history.replaceState;

		window.history.pushState = function ( ...args ) {
			originalPushState.apply( this, args );
			updateRoute();
		};
		window.history.replaceState = function ( ...args ) {
			originalReplaceState.apply( this, args );
			updateRoute();
		};

		window.addEventListener( 'popstate', updateRoute );

		return () => {
			window.history.pushState = originalPushState;
			window.history.replaceState = originalReplaceState;
			window.removeEventListener( 'popstate', updateRoute );
		};
	}, [] );

	return route;
}

function HelpCenterWithRouteTracking( { HelpCenter } ) {
	const currentRoute = useCurrentRoute();
	const botProps = helpCenterData.isCommerceGarden
		? { newInteractionsBotSlug: 'ciab-workflow-support_chat' }
		: {};

	return (
		<HelpCenter
			locale={ helpCenterData.locale }
			sectionName={ helpCenterData.sectionName || 'gutenberg-editor' }
			currentUser={ helpCenterData.currentUser }
			site={ helpCenterData.site }
			hasPurchases={ false }
			onboardingUrl="https://wordpress.com/start"
			handleClose={ () => dispatch( 'automattic/help-center' ).setShowHelpCenter( false ) }
			product={ helpCenterData.isCommerceGarden ? 'commerce-garden' : undefined }
			currentRoute={ currentRoute }
			{ ...botProps }
		/>
	);
}

