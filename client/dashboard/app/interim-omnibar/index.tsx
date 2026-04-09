import { hydrateRoot } from 'react-dom/client';
import type { OmnibarEvents } from './omnibar-events';

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

	const { InterimOmnibarContainer } = await import( './interim-omnibar-container' );

	hydrateRoot(
		container,
		<InterimOmnibarContainer initialUser={ window.currentUser ?? null } events={ events } />
	);
}
