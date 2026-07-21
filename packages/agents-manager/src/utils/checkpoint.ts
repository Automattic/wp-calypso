import { store as coreStore } from '@wordpress/core-data';
import { dispatch, select } from '@wordpress/data';

/**
 * Global styles snapshot stored per checkpoint ID.
 */
interface CheckpointState {
	globalStylesSettings?: Record< string, unknown >;
	globalStylesStyles?: Record< string, unknown >;
}

/**
 * The restore contract shared by AM's checkpoint store and provider ones.
 */
export interface CheckpointStore {
	hasCheckpoint: ( id: string ) => boolean;
	restoreCheckpoint: ( id: string ) => Promise< void >;
}

// Module-scoped so all callers share the same checkpoints.
const checkpoints = new Map< string, CheckpointState >();

const getGlobalStylesId = (): string =>
	(
		select( coreStore ) as { __experimentalGetCurrentGlobalStylesId: () => string }
	 ).__experimentalGetCurrentGlobalStylesId();

/**
 * Snapshots the current global styles so AI style changes (color, font,
 * button) can be undone.
 */
export function setCheckpoint( id: string ): void {
	const globalStylesId = getGlobalStylesId();
	if ( ! id || ! globalStylesId ) {
		return;
	}

	const record = (
		select( coreStore ) as {
			getEditedEntityRecord: (
				kind: string,
				name: string,
				key: string
			) => Record< string, unknown >;
		}
	 ).getEditedEntityRecord( 'root', 'globalStyles', globalStylesId );

	// Clone only the stored subtrees; entity records are JSON-safe.
	checkpoints.set(
		id,
		JSON.parse(
			JSON.stringify( {
				globalStylesSettings: record?.settings,
				globalStylesStyles: record?.styles,
			} )
		)
	);
}

export async function restoreCheckpoint( id: string ): Promise< void > {
	const state = checkpoints.get( id );
	const globalStylesId = getGlobalStylesId();
	if ( ! state || ! globalStylesId ) {
		return;
	}

	await dispatch( coreStore ).editEntityRecord( 'root', 'globalStyles', globalStylesId, {
		settings: state.globalStylesSettings || {},
		styles: state.globalStylesStyles || {},
	} );
}

export function hasCheckpoint( id: string ): boolean {
	return checkpoints.has( id );
}
