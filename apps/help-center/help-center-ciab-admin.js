/* global helpCenterData */
import './config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { dispatch, select } from '@wordpress/data';
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

function loadHelpCenter() {
	if ( document.getElementById( 'jetpack-help-center' ) ) {
		return Promise.resolve();
	}
	const queryClient = new QueryClient();
	const container = document.createElement( 'div' );
	container.id = 'jetpack-help-center';
	document.body.appendChild( container );

	return import( '@automattic/help-center' ).then( ( { default: HelpCenter } ) =>
		createRoot( container ).render(
			<QueryClientProvider client={ queryClient }>
				<HelpCenterWithRouteTracking HelpCenter={ HelpCenter } />
			</QueryClientProvider>
		)
	);
}

async function shouldAutoLoadHelpCenter() {
	const preferences = canAccessWpcomApis()
		? await wpcomRequest( {
				path: '/me/preferences',
				apiNamespace: 'wpcom/v2',
		  } )
				.then( ( prefs ) => prefs.calypso_preferences )
				.catch( () => {} )
		: await apiFetch( {
				global: true,
				path: '/help-center/open-state',
		  } ).catch( () => {} );

	return preferences?.help_center_open;
}

// Check if the user had the Help Center open in a previous session.
shouldAutoLoadHelpCenter().then( ( shouldAutoLoad ) => {
	if ( shouldAutoLoad ) {
		loadHelpCenter();
	}
} );
