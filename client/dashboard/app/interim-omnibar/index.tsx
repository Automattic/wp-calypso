import { fetchUser } from '@automattic/api-core';
import { queryClient, siteByIdQuery } from '@automattic/api-queries';
import { hydrateRoot } from 'react-dom/client';
import { AUTH_QUERY_KEY } from '../auth';
import type { OmnibarEvents } from './click-handlers';

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
		queryClient.fetchQuery( { queryKey: AUTH_QUERY_KEY, queryFn: fetchUser } ),
	] );

	// Hydrate the server-rendered omnibar with null props to match SSR output,
	// then immediately re-render with real data.  Suppress recoverable hydration
	// errors caused by Suspense boundaries inside MasterbarLoggedIn that
	// renderToString cannot serialize (see logged-in.jsx for the proper fix).
	const root = hydrateRoot(
		container,
		<InterimOmnibar user={ null } site={ null } currentRoute={ window.location.pathname } />,
		{ onRecoverableError() {} }
	);

	const site = user.primary_blog
		? await queryClient.fetchQuery( siteByIdQuery( user.primary_blog ) )
		: null;

	root.render(
		<InterimOmnibar
			user={ user }
			site={ site }
			currentRoute={ window.location.pathname }
			onToggleMenu={ () => events.mobileMenu.emit() }
			onToggleNotifications={ () => events.notifications.emit() }
		/>
	);
}
