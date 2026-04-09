import { defaultI18n } from '@wordpress/i18n';
import { hydrateRoot } from 'react-dom/client';
import { getUserLanguage, loadUserLocaleData } from '../shared-locale-loader';
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

	// Apply the user's locale to `defaultI18n` before hydrating so the first
	// client render matches the SSR-translated HTML. `getUserLanguage` mirrors
	// the server's `setUpLoggedInRoute` derivation so both sides agree on the
	// effective locale.
	const [ { InterimOmnibarContainer }, localeData ] = await Promise.all( [
		import( './interim-omnibar-container' ),
		loadUserLocaleData( getUserLanguage( window.currentUser ?? null ) ),
	] );

	defaultI18n.resetLocaleData( localeData );

	hydrateRoot(
		container,
		<InterimOmnibarContainer initialUser={ window.currentUser ?? null } events={ events } />
	);
}
