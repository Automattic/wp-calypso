import { useMediaQuery } from '@wordpress/compose';
import { useSyncExternalStore } from '@wordpress/element';

// On Gutenberg editor screens, only dock when fullscreen mode is on —
// otherwise wp-admin's chrome leaves too little room for the editor.
const FULLSCREEN_GATED_BODY_CLASSES = [ 'post-php', 'post-new-php', 'site-editor-php' ];
const FULLSCREEN_BODY_CLASS = 'is-fullscreen-mode';

export const DEFAULT_DESKTOP_MEDIA_QUERY = '(min-width: 1200px)';

export function getIsFullscreenGateOpen(): boolean {
	const { classList } = document.body;
	const isGated = FULLSCREEN_GATED_BODY_CLASSES.some( ( cls ) => classList.contains( cls ) );
	return ! isGated || classList.contains( FULLSCREEN_BODY_CLASS );
}

// Hoisted so the reference stays stable — otherwise `useSyncExternalStore`
// would tear down and re-create the observer on every render.
function subscribeToBodyClasses( notify: () => void ): () => void {
	const observer = new MutationObserver( notify );
	observer.observe( document.body, { attributes: true, attributeFilter: [ 'class' ] } );
	return () => observer.disconnect();
}

/**
 * Whether the assistant can dock: requires a desktop viewport and, on Gutenberg
 * editor screens, fullscreen mode.
 *
 * IMPORTANT: Keep this logic in sync with
 * `jetpack/projects/packages/agents-manager/src/js/sidebar-docking-gate.ts`.
 */
export const useCanDock = ( { desktopMediaQuery }: { desktopMediaQuery: string } ) => {
	const isDesktop = useMediaQuery( desktopMediaQuery );
	const isFullscreenGateOpen = useSyncExternalStore(
		subscribeToBodyClasses,
		getIsFullscreenGateOpen
	);

	return { canDock: isDesktop && isFullscreenGateOpen, isDesktop };
};

/**
 * Whether the chat can dock right now. The non-hook form of `useCanDock`,
 * for code that reads it once per call.
 */
export function getCanDock(): boolean {
	return window.matchMedia( DEFAULT_DESKTOP_MEDIA_QUERY ).matches && getIsFullscreenGateOpen();
}
