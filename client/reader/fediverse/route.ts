import { TIMELINE_TAB } from './helper';

const BASE = '/reader/fediverse';

export function getTimelineUrl( connectionId: number ): string {
	return `${ BASE }/${ connectionId }/${ TIMELINE_TAB }`;
}

export function getProfileUrl( connectionId: number, actor: string ): string {
	return `${ BASE }/${ connectionId }/profile/${ encodeURIComponent( actor ) }`;
}

export function getFollowersUrl( connectionId: number, actor: string ): string {
	return `${ getProfileUrl( connectionId, actor ) }/followers`;
}

export function getFollowingUrl( connectionId: number, actor: string ): string {
	return `${ getProfileUrl( connectionId, actor ) }/following`;
}

/**
 * Parse the host from a connection URL. Returns null on parse failure
 * so callers can decide whether to fall back to a generic value or
 * skip the qualification entirely.
 */
export function hostFromUrl( url: string ): string | null {
	try {
		return new URL( url ).host;
	} catch {
		return null;
	}
}
