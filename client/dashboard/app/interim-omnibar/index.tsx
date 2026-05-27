// eslint-disable-next-line no-restricted-imports
import { I18N, I18NContext } from 'i18n-calypso';
import { hydrateRoot } from 'react-dom/client';
import { getUserLanguage, loadUserLocaleData } from '../shared-locale-loader';
import type { OmnibarEvents } from '../omnibar/events';

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

	// Create a per-tree i18n-calypso instance loaded with the user's locale so
	// the first client render matches the SSR-translated HTML. Provided via
	// I18NContext so the `localize()` HOC picks it up without any global mutation.
	const [ { InterimOmnibarContainer }, localeData ] = await Promise.all( [
		import( './interim-omnibar-container' ),
		loadUserLocaleData( getUserLanguage( window.currentUser ?? null ) ),
	] );

	const i18n = new I18N();
	if ( localeData ) {
		i18n.setLocale( localeData );
	}

	hydrateRoot(
		container,
		<I18NContext.Provider value={ i18n }>
			<InterimOmnibarContainer initialUser={ window.currentUser ?? null } events={ events } />
		</I18NContext.Provider>
	);
}
