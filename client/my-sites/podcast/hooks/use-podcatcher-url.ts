import { useCallback } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import getSiteSetting from 'calypso/state/selectors/get-site-setting';
import { saveSiteSettings } from 'calypso/state/site-settings/actions';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';

const SAVE_FAILED = 'podcatcher_url_save_failed';

// Reads the per-podcatcher value from a `podcasting_show_urls` payload.
// The backend pads missing keys with empty strings and PHP encodes an empty
// associative array as [], so the field can be an object, an empty array, or
// missing entirely.
const readShowUrl = ( showUrls: unknown, podcatcherId: string ): string | undefined => {
	if ( ! showUrls || typeof showUrls !== 'object' || Array.isArray( showUrls ) ) {
		return undefined;
	}
	const value = ( showUrls as Record< string, unknown > )[ podcatcherId ];
	return typeof value === 'string' ? value : undefined;
};

export const usePodcatcherUrl = (
	siteId: number | null | undefined,
	podcatcherId: string
): [ string, ( next: string ) => Promise< void > ] => {
	const dispatch = useDispatch();
	const url = useSelector( ( state ) => {
		if ( ! siteId ) {
			return '';
		}
		return (
			readShowUrl( getSiteSetting( state, siteId, 'podcasting_show_urls' ), podcatcherId ) ?? ''
		);
	} );

	// Each save patches a single key; the backend merges it into the stored
	// option and treats an empty string as a delete (see wpcom PR 214724).
	// The backend silently drops URLs that fail validation (wrong host,
	// non-https, etc.), so we compare what came back to confirm the write
	// actually landed and reject otherwise.
	const save = useCallback(
		async ( next: string ): Promise< void > => {
			if ( ! siteId ) {
				throw new Error( SAVE_FAILED );
			}
			const trimmed = next.trim();
			// `saveSiteSettings` doesn't throw on failure — it `return error;`,
			// so the awaited value can be the response body OR an Error.
			const result = ( await dispatch(
				saveSiteSettings( siteId, {
					podcasting_show_urls: { [ podcatcherId ]: trimmed },
				} )
			) ) as { updated?: { podcasting_show_urls?: unknown } } | Error | null;

			if ( ! result || result instanceof Error ) {
				throw new Error( SAVE_FAILED );
			}

			// A bare error response (network failure, auth, etc.) lacks `updated`.
			if ( ! result.updated || ! ( 'podcasting_show_urls' in result.updated ) ) {
				throw new Error( SAVE_FAILED );
			}

			const persisted = readShowUrl( result.updated.podcasting_show_urls, podcatcherId );

			if ( trimmed === '' ) {
				// Delete intent — success means the key is absent or empty.
				if ( persisted && persisted !== '' ) {
					throw new Error( SAVE_FAILED );
				}
				return;
			}

			// Add/update intent — success means the response carries our exact value.
			if ( persisted !== trimmed ) {
				throw new Error( SAVE_FAILED );
			}
		},
		[ dispatch, siteId, podcatcherId ]
	);

	return [ url, save ];
};

// Returns true if at least one podcatcher entry under `podcasting_show_urls`
// is a non-empty string, false if we know there are none, or null if site
// settings haven't hydrated yet. Used to gate the first-save confetti so it
// only fires when we're sure this is the user's first save across all
// directories — never on a not-yet-loaded fallback.
export const useHasAnyStoredPodcatcherUrl = ( siteId: number | null | undefined ): boolean | null =>
	useSelector( ( state ) => {
		if ( ! siteId ) {
			return null;
		}
		// `getSiteSettings` returns null until the settings request resolves;
		// distinguishing that from "loaded with no URLs" is what avoids spurious
		// confetti on a fast click before hydration.
		if ( ! getSiteSettings( state, siteId ) ) {
			return null;
		}
		const showUrls = getSiteSetting( state, siteId, 'podcasting_show_urls' );
		if ( ! showUrls || typeof showUrls !== 'object' || Array.isArray( showUrls ) ) {
			return false;
		}
		return Object.values( showUrls as Record< string, unknown > ).some(
			( value ) => typeof value === 'string' && value.trim() !== ''
		);
	} );
