import { defaultI18n, type LocaleData } from '@wordpress/i18n';
import { hydrateRoot } from 'react-dom/client';
import type { OmnibarEvents } from './click-handlers';

declare global {
	interface Window {
		dashboardLocaleData?: LocaleData;
	}
}

export default async function loadOmnibar( events: OmnibarEvents ) {
	const container = document.getElementById( 'wpcom-omnibar' );
	if ( ! container ) {
		return;
	}

	// Apply the SSR-bootstrapped locale data to `defaultI18n` *before*
	// hydrating, so the omnibar's first client render uses the same translated
	// strings the server emitted. Without this, hydration would mismatch and
	// React would re-render in English first, then flip to translations.
	if ( window.dashboardLocaleData ) {
		defaultI18n.setLocaleData( window.dashboardLocaleData );
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
