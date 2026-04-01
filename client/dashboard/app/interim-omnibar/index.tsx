import { queryClient, siteByIdQuery } from '@automattic/api-queries';
import { defaultI18n } from '@wordpress/i18n';
import { hydrateRoot } from 'react-dom/client';
import { AUTH_QUERY_KEY, initializeCurrentUser } from '../auth';
import type { OmnibarEvents } from './click-handlers';
import type { User } from '@automattic/api-core';

async function loadLocaleData( user: User ) {
	const language =
		( user as User & { localeVariant?: string; localeSlug?: string } ).localeVariant ||
		( user as User & { localeVariant?: string; localeSlug?: string } ).localeSlug ||
		user.locale_variant ||
		user.language ||
		'en';

	if ( language === 'en' ) {
		return;
	}

	try {
		const response = await fetch(
			`https://widgets.wp.com/languages/calypso/${ language }-v1.1.json`
		);
		defaultI18n.resetLocaleData( await response.json() );
	} catch {
		// Fall back to English if loading fails.
	}
}

export default async function loadOmnibar( events: OmnibarEvents ) {
	const container = document.getElementById( 'wpcom-omnibar' );
	if ( ! container ) {
		return;
	}

	container.addEventListener( 'click', ( event ) => {
		if ( event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) {
			return;
		}

		const anchor = ( event.target as Element ).closest< HTMLAnchorElement >( 'a[href]' );
		if ( ! anchor || anchor.target === '_blank' ) {
			return;
		}

		const href = anchor.getAttribute( 'href' );
		if ( ! href ) {
			return;
		}

		events.linkClick.emit( { href, event } );
	} );

	const [ { InterimOmnibar }, user ] = await Promise.all( [
		import( './interim-omnibar' ),
		queryClient.fetchQuery( { queryKey: AUTH_QUERY_KEY, queryFn: initializeCurrentUser } ),
	] );

	// Hydrate matching the SSR output: user when bootstrapped, null when not.
	// Suppress recoverable hydration errors caused by Suspense boundaries inside
	// MasterbarLoggedIn that renderToString cannot serialize.
	const root = hydrateRoot(
		container,
		<InterimOmnibar
			user={ window.currentUser ?? null }
			site={ null }
			currentRoute={ window.location.pathname }
		/>,

		{ onRecoverableError() {} }
	);

	const [ site ] = await Promise.all( [
		user.primary_blog ? queryClient.fetchQuery( siteByIdQuery( user.primary_blog ) ) : null,
		loadLocaleData( user ),
	] );

	root.render(
		<InterimOmnibar
			user={ user }
			site={ site }
			currentRoute={ window.location.pathname }
			onToggleMenu={ () => events.mobileMenu.emit() }
			onToggleNotifications={ () =>
				events.notifications.emit(
					container.querySelector< HTMLElement >( '.masterbar-notifications' )
				)
			}
		/>
	);
}
