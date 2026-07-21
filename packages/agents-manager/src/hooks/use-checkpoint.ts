import { store as coreStore } from '@wordpress/core-data';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';

/**
 * Global styles snapshot stored at each checkpoint by `useCheckpoint`.
 */
interface CheckpointState {
	globalStylesSettings?: Record< string, unknown >;
	globalStylesStyles?: Record< string, unknown >;
}

/**
 * Return type of the `useCheckpoint` hook.
 */
export interface UseCheckpointReturn {
	setCheckpoint: ( id: string ) => void;
	restoreCheckpoint: ( id: string ) => Promise< void >;
	hasCheckpoint: ( id: string ) => boolean;
}

// Module-scoped so all callers share the same checkpoint store.
const sharedCheckpoints = new Map< string, CheckpointState >();

/**
 * Saves and restores global styles snapshots so that AI style changes
 * (color, font, button) can be undone.
 */
export default function useCheckpoint(): UseCheckpointReturn {
	const { globalStylesId, getEditedEntityRecord } = useSelect( ( select ) => {
		const core = select( coreStore ) as {
			__experimentalGetCurrentGlobalStylesId: () => string;
			getEditedEntityRecord: (
				kind: string,
				name: string,
				key: string
			) => Record< string, unknown >;
		};
		return {
			globalStylesId: core.__experimentalGetCurrentGlobalStylesId(),
			getEditedEntityRecord: core.getEditedEntityRecord,
		};
	}, [] );

	const { editEntityRecord } = useDispatch( coreStore );

	const setCheckpoint = useCallback(
		( id: string ) => {
			if ( ! id || ! globalStylesId ) {
				return;
			}
			const record = getEditedEntityRecord( 'root', 'globalStyles', globalStylesId );
			const copy = record ? JSON.parse( JSON.stringify( record ) ) : {};
			sharedCheckpoints.set( id, {
				globalStylesSettings: copy.settings,
				globalStylesStyles: copy.styles,
			} );
		},
		[ globalStylesId, getEditedEntityRecord ]
	);

	const restoreCheckpoint = useCallback(
		async ( id: string ) => {
			const state = sharedCheckpoints.get( id );
			if ( ! state || ! globalStylesId ) {
				return;
			}
			await editEntityRecord( 'root', 'globalStyles', globalStylesId, {
				settings: state.globalStylesSettings || {},
				styles: state.globalStylesStyles || {},
			} );
		},
		[ globalStylesId, editEntityRecord ]
	);

	const hasCheckpoint = useCallback( ( id: string ) => sharedCheckpoints.has( id ), [] );

	return {
		setCheckpoint,
		restoreCheckpoint,
		hasCheckpoint,
	};
}
