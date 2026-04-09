import { hydrateRoot } from 'react-dom/client';
import { getUserLanguage, loadUserLocale } from '../shared-locale-loader';
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

	// Apply the user's locale to `defaultI18n` before hydrating, so the first
	// client render matches the SSR-translated HTML.
	await loadUserLocale( getUserLanguage( window.currentUser ?? null ) );

	const { InterimOmnibarContainer } = await import( './interim-omnibar-container' );

	hydrateRoot(
		container,
		<InterimOmnibarContainer initialUser={ window.currentUser ?? null } events={ events } />
	);
}
