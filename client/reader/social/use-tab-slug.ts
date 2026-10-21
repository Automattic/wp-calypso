import page from '@automattic/calypso-router';
import { useEffect, useRef } from 'react';

interface UseTabSlugOptions {
	allowedSlugs: readonly string[];
	defaultSlug: string;
}

interface UseTabSlugResult {
	slug: string;
	isDefault: boolean;
}

function readSearch(): URLSearchParams {
	if ( typeof window === 'undefined' ) {
		return new URLSearchParams();
	}
	return new URLSearchParams( window.location.search );
}

function readPathname(): string {
	if ( typeof window === 'undefined' ) {
		return '';
	}
	return window.location.pathname;
}

/**
 * Reads `?tab=` from the current location and validates it against
 * `allowedSlugs`. Side-effects a single `page.replace` to the default slug
 * when the value is malformed (gated on a ref so repeated renders with the
 * same malformed value don't loop). If the URL has changed to a valid slug
 * between render and effect commit (e.g. a same-batch tab click), the
 * rewrite is suppressed so the user's valid choice isn't clobbered.
 *
 * Protocol-agnostic — no knowledge of filter enums, route bases, or
 * Tracks events. Wrappers translate the slug to whatever they need.
 */
export function useTabSlug( { allowedSlugs, defaultSlug }: UseTabSlugOptions ): UseTabSlugResult {
	const correctedFor = useRef< string | null >( null );

	const search = readSearch();
	const slug = search.get( 'tab' );
	const isAllowed = slug !== null && allowedSlugs.includes( slug );

	useEffect( () => {
		if ( slug === null ) {
			return;
		}
		if ( allowedSlugs.includes( slug ) ) {
			correctedFor.current = null;
			return;
		}
		if ( correctedFor.current === slug ) {
			return;
		}
		// Re-validate against the live URL: between render and effect commit
		// another `page.replace` (e.g. a same-batch tab click) could have
		// changed `?tab=` to a valid value. Without this guard the effect
		// would clobber the user's valid choice with the default.
		const liveSlug = readSearch().get( 'tab' );
		if ( liveSlug === null || allowedSlugs.includes( liveSlug ) ) {
			return;
		}
		correctedFor.current = liveSlug;
		const next = new URLSearchParams( window.location.search );
		next.set( 'tab', defaultSlug );
		page.replace( `${ readPathname() }?${ next.toString() }` );
	}, [ slug, allowedSlugs, defaultSlug ] );

	if ( slug === null ) {
		return { slug: defaultSlug, isDefault: true };
	}
	if ( isAllowed ) {
		return { slug, isDefault: false };
	}
	return { slug: defaultSlug, isDefault: true };
}
