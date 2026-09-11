import { isRecord } from './is-record';
import { providerActions, providerSelectors } from './provider-store';
import { getSiteRecord, saveSiteFields, SITE_RECORD_UNAVAILABLE } from './site-record';

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

/**
 * Merges `changes` into the site metadata and saves it. Agent edits stay out of
 * the editor's undo stack — `restore-checkpoint` is the undo the agent offers.
 *
 * Saved rather than left pending, unlike most editor writes: nothing about this
 * field is visible on screen, so there is no cue telling the user a save is
 * outstanding, and a reload would drop the change the agent already reported
 * done.
 */
export async function setSiteMetadata( changes: SiteMetadata ): Promise< SiteMetadata > {
	const current = getSiteMetadata();

	// Unreadable, not empty — merging onto `{}` would drop every stored key.
	if ( current === undefined ) {
		throw new Error( SITE_RECORD_UNAVAILABLE );
	}

	const merged = { ...current, ...changes };

	await replaceSiteMetadata( merged );

	return merged;
}

// TODO (ability-migration): Delete once Big Sky no longer writes this field.
/**
 * Keeps Big Sky's copy in step. It rebuilds this field from its own store, not
 * from the site record, so a write it never saw would be undone by its next one.
 *
 * Its reducer merges, so a key this write drops is sent as `undefined` and
 * `JSON.stringify` leaves it out of what Big Sky persists. The runtime key is
 * exempt: it is Big Sky's to manage and never reaches the record.
 *
 * Keys Big Sky wrote earlier in the page load still win, and nothing here can
 * change that — its writer replays them from a module-level buffer.
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
		// The record is already saved: a stale Big Sky copy is the lesser harm
		// than reporting a saved write as failed.
	}
}

/**
 * Writes the metadata as given, replacing what is stored.
 *
 * What a checkpoint restore needs: merging a snapshot back would leave behind
 * any key the change introduced, so the undo would be incomplete.
 */
export async function replaceSiteMetadata( metadata: SiteMetadata ): Promise< void > {
	const { [ RUNTIME_KEY ]: _runtime, ...persisted } = metadata;

	await saveSiteFields( { [ METADATA_FIELD ]: JSON.stringify( persisted ) } );

	syncProviderMetadata( persisted );
}
