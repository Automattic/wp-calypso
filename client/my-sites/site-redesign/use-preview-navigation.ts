import { useEffect } from 'react';
import type { PreviewRoute } from './api';
import type { RefObject } from 'react';

export function resolvePreviewNavigation(
	value: unknown,
	generationId: string,
	siteUrl: string,
	currentPath: string,
	routes: PreviewRoute[]
): string | null {
	if ( ! value || typeof value !== 'object' ) {
		return null;
	}
	const message = value as {
		source?: unknown;
		type?: unknown;
		generation_id?: unknown;
		href?: unknown;
	};
	if (
		message.source !== 'site-redesign-preview' ||
		message.type !== 'navigate' ||
		message.generation_id !== generationId ||
		typeof message.href !== 'string'
	) {
		return null;
	}
	try {
		const site = new URL( siteUrl );
		const url = new URL( message.href, new URL( currentPath, site ) );
		if ( url.origin !== site.origin ) {
			return null;
		}
		const path = url.pathname + url.search;
		return routes.some( ( route ) => route.path === path ) ? path : null;
	} catch {
		return null;
	}
}

/** Accepts navigation only from the current opaque preview frame and its server generation. */
export function usePreviewNavigation(
	frame: RefObject< HTMLIFrameElement | null >,
	generationId: string | undefined,
	siteUrl: string,
	currentPath: string,
	routes: PreviewRoute[] | undefined,
	setPath: ( path: string ) => void
) {
	useEffect( () => {
		if ( ! generationId || ! routes ) {
			return;
		}
		const navigate = ( event: MessageEvent ) => {
			if ( ! frame.current || event.source !== frame.current.contentWindow ) {
				return;
			}
			const path = resolvePreviewNavigation(
				event.data,
				generationId,
				siteUrl,
				currentPath,
				routes
			);
			if ( path ) {
				setPath( path );
			}
		};
		window.addEventListener( 'message', navigate );
		return () => window.removeEventListener( 'message', navigate );
	}, [ frame, generationId, siteUrl, currentPath, routes, setPath ] );
}
