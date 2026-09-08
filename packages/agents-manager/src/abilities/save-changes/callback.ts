import { store as coreStore } from '@wordpress/core-data';
import { dispatch, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { isEditorPage } from '../../utils/is-editor-page';
import { errorResult, successResult } from '../ability-result';
import type { AbilityResult } from '../types';

type EntityKey = string | number | undefined;

export type DirtyEntityRecord = {
	kind: string;
	name: string;
	key?: EntityKey;
};

export interface SaveChangesIO {
	getDirtyEntityRecords: () => DirtyEntityRecord[];
	getSiteEdits: () => Record< string, unknown >;
	isSavingEntityRecord: ( kind: string, name: string, key?: EntityKey ) => boolean;
	editEntityRecord: (
		kind: string,
		name: string,
		key: EntityKey,
		edits: Record< string, unknown >
	) => void;
	saveEditedEntityRecord: (
		kind: string,
		name: string,
		key: EntityKey,
		options: { throwOnError: true }
	) => Promise< unknown >;
	saveSpecifiedSiteEdits?: (
		kind: 'root',
		name: 'site',
		key: undefined,
		properties: string[],
		options: { throwOnError: true }
	) => Promise< unknown >;
	markLastChangeAsPersistent?: () => void;
}

/**
 * Saves every entity currently staged in the editor through Gutenberg's normal
 * core-data save actions. Those actions drive the editor save lifecycle and the
 * REST updates that create WordPress revisions; the ability must not bypass them.
 */
export async function saveChanges( io: SaveChangesIO ): Promise< AbilityResult > {
	const dirtyEntityRecords = io.getDirtyEntityRecords();

	if ( dirtyEntityRecords.length === 0 ) {
		return successResult( __( 'There are no unsaved changes.', __i18n_text_domain__ ), {
			savedEntityCount: 0,
		} );
	}

	if (
		dirtyEntityRecords.some( ( { kind, name, key } ) => io.isSavingEntityRecord( kind, name, key ) )
	) {
		return errorResult(
			'The editor is already saving these changes.',
			__( 'The editor is already saving. Please try again when it finishes.', __i18n_text_domain__ )
		);
	}

	const saves: Promise< unknown >[] = [];

	for ( const { kind, name, key } of dirtyEntityRecords ) {
		if ( kind === 'root' && name === 'site' ) {
			const properties = Object.keys( io.getSiteEdits() );

			if ( properties.length > 0 && io.saveSpecifiedSiteEdits ) {
				saves.push(
					io.saveSpecifiedSiteEdits( 'root', 'site', undefined, properties, {
						throwOnError: true,
					} )
				);
				continue;
			}
		}

		// Core's Site Editor publishes navigation records as part of Save.
		if ( kind === 'postType' && name === 'wp_navigation' ) {
			io.editEntityRecord( kind, name, key, { status: 'publish' } );
		}

		saves.push( io.saveEditedEntityRecord( kind, name, key, { throwOnError: true } ) );
	}

	io.markLastChangeAsPersistent?.();

	const results = await Promise.allSettled( saves );
	const failed = results.filter( ( result ) => result.status === 'rejected' );
	const savedEntityCount = results.length - failed.length;

	if ( failed.length > 0 ) {
		const firstReason = failed[ 0 ].reason;
		const reason = firstReason instanceof Error ? firstReason.message : String( firstReason );

		return errorResult(
			reason,
			savedEntityCount > 0
				? __(
						'Some changes could not be saved. Your work is still here — try saving again.',
						__i18n_text_domain__
				  )
				: __(
						'Your changes could not be saved. Your work is still here — try saving again.',
						__i18n_text_domain__
				  ),
			{ savedEntityCount, failedEntityCount: failed.length }
		);
	}

	return successResult( __( 'Your changes have been saved.', __i18n_text_domain__ ), {
		savedEntityCount,
	} );
}

type CoreSelectors = {
	__experimentalGetDirtyEntityRecords?: () => DirtyEntityRecord[];
	getEntityRecordEdits?: (
		kind: string,
		name: string,
		key?: EntityKey
	) => Record< string, unknown > | undefined;
	isSavingEntityRecord?: ( kind: string, name: string, key?: EntityKey ) => boolean;
};

type CoreActions = {
	editEntityRecord?: SaveChangesIO[ 'editEntityRecord' ];
	saveEditedEntityRecord?: SaveChangesIO[ 'saveEditedEntityRecord' ];
	__experimentalSaveSpecifiedEntityEdits?: SaveChangesIO[ 'saveSpecifiedSiteEdits' ];
};

/** Runs the save ability against the stores registered by the editor. */
export async function saveChangesCallback(): Promise< AbilityResult > {
	if ( ! isEditorPage() ) {
		return errorResult( 'Changes can only be saved from the editor.' );
	}

	try {
		const core = select( coreStore ) as CoreSelectors | undefined;
		// Core's published type excludes the undefined site key that its own Site
		// Editor passes to __experimentalSaveSpecifiedEntityEdits.
		const coreActions = dispatch( coreStore ) as unknown as CoreActions | undefined;
		const blockEditorActions = dispatch( 'core/block-editor' ) as
			| { __unstableMarkLastChangeAsPersistent?: () => void }
			| undefined;

		if (
			! core?.__experimentalGetDirtyEntityRecords ||
			! core.isSavingEntityRecord ||
			! coreActions?.editEntityRecord ||
			! coreActions.saveEditedEntityRecord
		) {
			return errorResult( 'The editor save actions are unavailable.' );
		}

		return await saveChanges( {
			getDirtyEntityRecords: core.__experimentalGetDirtyEntityRecords,
			getSiteEdits: () => core.getEntityRecordEdits?.( 'root', 'site' ) ?? {},
			isSavingEntityRecord: core.isSavingEntityRecord,
			editEntityRecord: coreActions.editEntityRecord,
			saveEditedEntityRecord: coreActions.saveEditedEntityRecord,
			saveSpecifiedSiteEdits: coreActions.__experimentalSaveSpecifiedEntityEdits,
			markLastChangeAsPersistent: blockEditorActions?.__unstableMarkLastChangeAsPersistent,
		} );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Error saving editor changes:', error );
		return errorResult( error instanceof Error ? error.message : String( error ) );
	}
}
