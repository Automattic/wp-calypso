import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getLastFocusableElement } from 'calypso/lib/dom/focus';
import type { MenuItem } from 'calypso/data/jetpack/use-jetpack-masterbar-data-query';
import type { MouseEvent, RefObject } from 'react';

export const isMobile = () => {
	return window.innerWidth <= 900;
};

export const sortByMenuOrder = ( a: MenuItem, b: MenuItem ) => a.menu_order - b.menu_order;

export const onLinkClick = ( e: MouseEvent< HTMLAnchorElement >, track: string ) => {
	recordTracksEvent( track, {
		nav_item: e.currentTarget
			.getAttribute( 'href' )
			// Remove the hostname https://jetpack.com/ from the href
			// (including other languages, ie. es.jetpack.com, fr.jetpack.com, etc.)
			?.replace( /https?:\/\/[a-z]{0,2}.?jetpack.com/, '' ),
	} );
};

// 'calypso_jetpack_nav_item_click'

export const isValidLink = ( url: string ) => {
	return url && url !== '#';
};

export const closeOnFocusOut = (
	ref: RefObject< HTMLDivElement >,
	isOpen: boolean,
	toggle: () => void
) => {
	const lastFocusable = ref.current ? getLastFocusableElement( ref.current ) : null;

	if ( lastFocusable ) {
		lastFocusable.addEventListener(
			'focusout',
			() => {
				if ( isOpen ) {
					toggle();
				}
			},
			{ once: true }
		);
	}
};
