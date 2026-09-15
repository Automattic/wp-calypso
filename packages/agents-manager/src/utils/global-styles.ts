import { store as coreStore } from '@wordpress/core-data';
import { dispatch, select } from '@wordpress/data';
import { waitForStore } from './wait-for-store';

/** A theme.json `settings` or `styles` subtree. */
export type ThemeJson = Record< string, unknown >;

export interface GlobalStylesRecord {
	settings?: ThemeJson;
	styles?: ThemeJson;
}

// `select`/`dispatch` return `undefined` on surfaces where the `core-data`
// store is not registered — every access stays optional.
interface CoreSelect {
	__experimentalGetCurrentGlobalStylesId?: () => string | undefined;
	// An unresolved record reads as `false`, not `undefined`.
	getEditedEntityRecord: (
		kind: string,
		name: string,
		id: string
	) => GlobalStylesRecord | false | undefined;
}

interface CoreDispatch {
	editEntityRecord: (
		kind: string,
		name: string,
		id: string,
		edits: GlobalStylesRecord,
		options: { undoIgnore: boolean }
	) => void;
}

const LOAD_TIMEOUT_MS = 10000;

export interface EditedGlobalStyles {
	id: string;
	record: Required< GlobalStylesRecord >;
}

/**
 * The editor's global styles with the session's unsaved edits, or `undefined`
 * until the record is loaded.
 */
export function getEditedGlobalStyles(): EditedGlobalStyles | undefined {
	const core = select( coreStore ) as CoreSelect | undefined;
	const id = core?.__experimentalGetCurrentGlobalStylesId?.();
	const record = id ? core?.getEditedEntityRecord( 'root', 'globalStyles', id ) : undefined;

	if ( ! id || ! record ) {
		return undefined;
	}

	return { id, record: { settings: record.settings ?? {}, styles: record.styles ?? {} } };
}

/**
 * The edited global styles once the record is loaded: reading it starts the
 * fetch on editors that do not load it at boot, like the post editor.
 * Resolves `undefined` after the timeout.
 */
export async function waitForEditedGlobalStyles(): Promise< EditedGlobalStyles | undefined > {
	const loaded = await waitForStore(
		coreStore.name,
		() => !! getEditedGlobalStyles(),
		LOAD_TIMEOUT_MS
	);

	return loaded ? getEditedGlobalStyles() : undefined;
}

/**
 * Edits the global styles outside the editor's undo stack — `restore-checkpoint`
 * is the undo the agent offers. Throws where the store is unavailable.
 */
export function editGlobalStyles( id: string, edits: GlobalStylesRecord ): void {
	const coreDispatch = dispatch( coreStore ) as CoreDispatch | undefined;

	if ( ! coreDispatch ) {
		throw new Error( 'Global styles are unavailable to edit.' );
	}

	coreDispatch.editEntityRecord( 'root', 'globalStyles', id, edits, { undoIgnore: true } );
}
