import { isRecord } from './is-record';
import { providerActions, providerSelectors } from './provider-store';
import { editSiteFields, getSiteRecord, SITE_RECORD_UNAVAILABLE } from './site-record';

/**
 * Big Sky's site metadata — personality, site location, the title it renders
 * from — stored as a JSON string in the `big_sky_site_metadata` site setting.
 *
 * Read from the site record rather than a `window` global: the setting is
 * registered with `show_in_rest`, so core-data serves it, and a write has to
 * merge onto the stored value. Reading a global instead would drift from it
 * and turn a one-key change into a wipe of every other key.
 */
export type SiteMetadata = Record< string, unknown >;

const METADATA_FIELD = 'big_sky_site_metadata';

// Runtime-only, and never persisted alongside the rest.
const RUNTIME_KEY = 'mode';

const parseMetadata = ( value: unknown ): SiteMetadata => {
	if ( isRecord( value ) ) {
		return value;
	}

	if ( typeof value !== 'string' || ! value ) {
		return {};
	}

	try {
		const parsed = JSON.parse( value );

		return isRecord( parsed ) ? parsed : {};
	} catch {
		// A malformed setting is not worth failing a write over; merging onto
		// `{}` loses no more than the string already had.
		return {};
	}
};

/**
 * The metadata the editor currently holds, or `undefined` where the site
 * record is unreadable — which a caller must not mistake for "no metadata",
 * since merging onto `{}` would drop every stored key.
 */
export function getSiteMetadata(): SiteMetadata | undefined {
	const site = getSiteRecord();

	return site ? parseMetadata( site[ METADATA_FIELD ] ) : undefined;
}

/** Merges `changes` into the site metadata, pending the user's Save. */
export function setSiteMetadata( changes: SiteMetadata ): SiteMetadata {
	const current = getSiteMetadata();

	// Unreadable, not empty — merging onto `{}` would drop every stored key.
	if ( current === undefined ) {
		throw new Error( SITE_RECORD_UNAVAILABLE );
	}

	// Big Sky's runtime state, never stored: a change to it would be dropped
	// at the write and still reported as applied.
	if ( RUNTIME_KEY in changes ) {
		throw new Error( `${ RUNTIME_KEY } is Big Sky's runtime state and cannot be set.` );
	}

	const { [ RUNTIME_KEY ]: _runtime, ...merged } = { ...current, ...changes };

	replaceSiteMetadata( merged );

	return merged;
}

// TODO (ability-migration): Delete once Big Sky no longer writes this field.
/**
 * Keeps Big Sky's copy in step: it rebuilds this field from its own store, so
 * a write it never saw would be undone by its next one. Its reducer merges, so
 * a dropped key is sent as `undefined`, which `JSON.stringify` leaves out. The
 * runtime key is Big Sky's own and never reaches the record.
 *
 * Keys Big Sky wrote earlier in the page load still win: its writer replays
 * them from a buffer nothing here can clear.
 */
function syncProviderMetadata( metadata: SiteMetadata ): void {
	const provider = providerActions< { setSiteMetadata?: ( metadata: SiteMetadata ) => void } >();

	if ( ! provider?.setSiteMetadata ) {
		return;
	}

	try {
		const current =
			providerSelectors< { getSiteMetadata?: () => SiteMetadata } >()?.getSiteMetadata?.() ?? {};
		const dropped = Object.keys( current ).filter(
			( key ) => key !== RUNTIME_KEY && ! ( key in metadata )
		);

		provider.setSiteMetadata( {
			...Object.fromEntries( dropped.map( ( key ) => [ key, undefined ] ) ),
			...metadata,
		} );
	} catch {
		// The edit is already applied: a stale Big Sky copy is the lesser harm
		// than reporting an applied write as failed.
	}
}

/**
 * Writes the metadata as given, replacing what is stored.
 *
 * What a checkpoint restore needs: merging a snapshot back would leave behind
 * any key the change introduced, so the undo would be incomplete.
 */
export function replaceSiteMetadata( metadata: SiteMetadata ): void {
	const { [ RUNTIME_KEY ]: _runtime, ...stored } = metadata;

	editSiteFields( { [ METADATA_FIELD ]: JSON.stringify( stored ) } );

	syncProviderMetadata( stored );
}
