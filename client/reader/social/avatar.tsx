/**
 * Thin `<img>` wrapper used by every Reader Social surface that renders
 * a remote avatar or banner image. Two reasons it exists:
 *
 *  1. Reader Social surfaces consume URLs from third-party services
 *     (Bluesky CDN, Mastodon instances, AP servers). Those URLs can 404,
 *     resolve to a stale path after an instance migration, or fail at
 *     load time on a slow network. Without an `onError` fallback the
 *     browser leaves a broken-image icon in the layout — visible in
 *     every avatar slot across timeline / profile / notifications /
 *     account-row / compose-pill surfaces.
 *  2. Each surface already has a "no src" branch with a tailored
 *     placeholder element (a `<div>` sized to the avatar slot, a
 *     `<span>` with placeholder styling, etc.). The fallback for a
 *     load failure should reuse that same placeholder, not introduce a
 *     second visual state. This component takes the placeholder as a
 *     `fallback` prop and renders it on either branch (no src OR
 *     `onError`), so the call site stays the single source of truth
 *     for what "no image" looks like.
 *
 * The `errored` flag resets when `src` changes so a new URL gets a
 * fresh chance to load — useful for surfaces that re-render with a
 * different actor (account-row inside an infinite feed, compose-pill
 * after the user switches connections).
 */

import { useEffect, useState } from 'react';
import type { ImgHTMLAttributes, ReactNode } from 'react';

export interface SocialAvatarProps
	extends Omit< ImgHTMLAttributes< HTMLImageElement >, 'onError' | 'src' > {
	src: string | null | undefined;
	/**
	 * Rendered when `src` is null/empty OR when the `<img>` fired its
	 * `onError` event. Defaults to `null` (no element) so callers that
	 * only want to hide a broken banner without showing anything in its
	 * place don't have to pass `fallback={ null }` explicitly.
	 */
	fallback?: ReactNode;
}

export function SocialAvatar( { src, fallback = null, alt = '', ...imgProps }: SocialAvatarProps ) {
	const [ errored, setErrored ] = useState( false );

	// Reset on src change so a re-render with a different URL gets to try
	// loading from scratch (the previous URL's error shouldn't poison the
	// new one).
	useEffect( () => {
		setErrored( false );
	}, [ src ] );

	if ( ! src || errored ) {
		return <>{ fallback }</>;
	}

	return <img src={ src } alt={ alt } onError={ () => setErrored( true ) } { ...imgProps } />;
}
