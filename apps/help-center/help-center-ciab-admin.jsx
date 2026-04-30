/* global __i18n_text_domain__, helpCenterData */
import './config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { dispatch, select, subscribe } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
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

const unsubscribe = subscribe( () => {
	// Make sure the wp-logo menu item is registered before unregistering its default items.
	// Use optional chaining since 'next-admin' store only exists in next-admin context
	if ( select( 'next-admin' )?.getMetaMenuItems?.( 'wp-logo' )?.length > 1 ) {
		unsubscribe();
		// Check if the user has the HC already open from a previous session.
		shouldAutoLoadHelpCenter().then( ( shouldAutoLoad ) => {
			if ( shouldAutoLoad ) {
				loadHelpCenter();
			}
		} );
		// wait for the next tick to ensure the menu items are registered
		queueMicrotask( () => {
			select( 'next-admin' )
				?.getMetaMenuItems?.( 'wp-logo' )
				?.forEach( ( item ) => {
					dispatch( 'next-admin' )?.unregisterSiteHubHelpMenuItem?.( item.id );
				} );
			dispatch( 'next-admin' )?.registerSiteHubHelpMenuItem?.( 'help-center', {
				label: __( 'Help Center', __i18n_text_domain__ ),
				parent: 'wp-logo',
				callback: () => {
					return loadHelpCenter().then( () => {
						const state = select( 'automattic/help-center' ).isHelpCenterShown();
						dispatch( 'automattic/help-center' ).setShowHelpCenter( ! state );
					} );
				},
			} );
		} );
	}
} );
