import { store as coreStore } from '@wordpress/core-data';
import { dispatch, select } from '@wordpress/data';

/**
 * AM-owned checkpoint store: in-memory, per page load, keyed by tool call id.
 *
 * Ported from Big Sky's `use-checkpoint` as plain functions — AM abilities
 * execute as plain callbacks, so no hook wiring is needed. Only the
 * global-styles domain (`color`/`font`/`button` keys) restores today; the
 * block, page, and navigation domains land with their abilities. Until then,
 * checkpoints for those domains live in Big Sky's store and restore through
 * the `provider-checkpoints` bridge.
 *
 * Big Sky additionally re-applies the checkpoint's variation titles after the
 * snapshot restore to sync its variation-selection store. AM has no such
 * store — the entity snapshot alone restores the full visual state.
 */

// Big Sky's scoped checkpoint keys — they gate which domains a restore
// applies. The theme domain restores the full global-styles snapshot
// wholesale, matching Big Sky.
export const checkpointKeys = {
	COLOR: 'color',
	FONT: 'font',
	BUTTON: 'button',
} as const;

const THEME_KEYS: string[] = [ checkpointKeys.COLOR, checkpointKeys.FONT, checkpointKeys.BUTTON ];

export const RESTORE_CHECKPOINT_TOOL_ID = 'big_sky__restore_checkpoint';

export interface CheckpointMetadata {
	toolId?: string;
	summary?: string;
	requestIntentType?: 'undo' | 'redo' | 'restore';
	createdByRequestIntentType?: string;
	restoresCheckpointId?: string;
	restoredCheckpointToolId?: string;
}

type GlobalStylesSnapshot = {
	settings: Record< string, unknown >;
	styles: Record< string, unknown >;
};

export interface CheckpointRecord extends CheckpointMetadata {
	id: string;
	checkpointKeys: string[];
	themeBeforeUpdate?: GlobalStylesSnapshot;
}

const records = new Map< string, CheckpointRecord >();

// JSON round-trip like Big Sky: snapshots must not share references with the
// live edited record, and non-serializable values must not survive into them.
const deepClone = < T >( value: T ): T => JSON.parse( JSON.stringify( value ) );

type CoreSelect = {
	__experimentalGetCurrentGlobalStylesId?: () => string | undefined;
	getEditedEntityRecord: (
		kind: string,
		name: string,
		id: string
	) => { settings?: Record< string, unknown >; styles?: Record< string, unknown > } | undefined;
};

type CoreDispatch = {
	editEntityRecord: (
		kind: string,
		name: string,
		id: string,
		edits: Record< string, unknown >,
		options: { undoIgnore: boolean }
	) => void;
};

// `select`/`dispatch` return `undefined` on surfaces where the `core-data`
// store is not registered — every access stays optional.
const getGlobalStylesId = () =>
	( select( coreStore ) as CoreSelect | undefined )?.__experimentalGetCurrentGlobalStylesId?.();

function captureThemeSnapshot(): GlobalStylesSnapshot | undefined {
	const globalStylesId = getGlobalStylesId();
	if ( ! globalStylesId ) {
		return undefined;
	}

	const globalStyles = ( select( coreStore ) as CoreSelect | undefined )?.getEditedEntityRecord(
		'root',
		'globalStyles',
		globalStylesId
	);
	if ( ! globalStyles ) {
		return undefined;
	}

	return deepClone( {
		settings: globalStyles.settings || {},
		styles: globalStyles.styles || {},
	} );
}

// Throws instead of no-opping when the snapshot or target is missing — a
// silent skip would let the agent report an undo that never happened.
function restoreThemeSnapshot( checkpoint: CheckpointRecord ): void {
	const restoresTheme = checkpoint.checkpointKeys.some( ( key ) => THEME_KEYS.includes( key ) );
	if ( ! restoresTheme ) {
		return;
	}

	if ( ! checkpoint.themeBeforeUpdate ) {
		throw new Error( 'Checkpoint has no global-styles snapshot to restore.' );
	}

	const globalStylesId = getGlobalStylesId();
	if ( ! globalStylesId ) {
		throw new Error( 'Global styles are unavailable to restore into.' );
	}

	const coreDispatch = dispatch( coreStore ) as CoreDispatch | undefined;
	if ( ! coreDispatch ) {
		throw new Error( 'Global styles are unavailable to restore into.' );
	}

	coreDispatch.editEntityRecord(
		'root',
		'globalStyles',
		globalStylesId,
		checkpoint.themeBeforeUpdate,
		{ undoIgnore: true }
	);
}

/**
 * Snapshots the current editor state under the given id; the keys scope what
 * a restore applies.
 */
export function setCheckpoint(
	id: string,
	keys: string[],
	metadata: CheckpointMetadata = {}
): void {
	if ( ! id ) {
		return;
	}

	const themeBeforeUpdate = captureThemeSnapshot();

	records.set( id, {
		...metadata,
		id,
		checkpointKeys: keys,
		...( themeBeforeUpdate && { themeBeforeUpdate } ),
	} );
}

export function hasCheckpoint( id: string ): boolean {
	return records.has( id );
}

export function getCheckpoint( id: string ): CheckpointRecord | undefined {
	return records.get( id );
}

export function clearCheckpoint( id: string ): void {
	records.delete( id );
}

/** Returns all checkpoints, oldest first. */
export function getCheckpoints(): CheckpointRecord[] {
	return [ ...records.values() ];
}

/**
 * Restores the editor state a checkpoint captured, scoped to its keys.
 */
export async function restoreCheckpoint( id: string ): Promise< void > {
	const checkpoint = records.get( id );
	if ( ! checkpoint ) {
		throw new Error( `Checkpoint not found: ${ id }` );
	}

	restoreThemeSnapshot( checkpoint );
}

export type CheckpointContextItem = CheckpointMetadata & {
	checkpointId: string;
	checkpointIndex: number;
	checkpointKeys: string[];
	isLatestForTool?: boolean;
};

/**
 * The AM-held checkpoints advertised to the agent via the client context for
 * `restore-checkpoint`. While the migration runs, the loader appends them to
 * the provider's own list, and ids from either store restore.
 */
export function getAvailableCheckpoints(): CheckpointContextItem[] {
	const checkpoints = getCheckpoints();
	const latestIndexByToolId: Record< string, number > = {};
	checkpoints.forEach( ( { toolId }, index ) => {
		if ( toolId ) {
			latestIndexByToolId[ toolId ] = index;
		}
	} );

	// The snapshot stays out of the model-facing list.
	return checkpoints.map( ( { id, themeBeforeUpdate: _snapshot, ...checkpoint }, index ) => ( {
		...checkpoint,
		checkpointId: id,
		checkpointIndex: index,
		...( checkpoint.toolId && {
			isLatestForTool: latestIndexByToolId[ checkpoint.toolId ] === index,
		} ),
	} ) );
}
