import { __ } from '@wordpress/i18n';
import { THEME_CHECKPOINT_KEYS, withCheckpoint } from '../../utils/checkpoints';
import { waitForEditedGlobalStyles } from '../../utils/global-styles';
import { isEditorPage } from '../../utils/is-editor-page';
import { applyThemeUpdate, normalizeThemeUpdate } from '../../utils/update-theme';
import { errorResult, successResult } from '../ability-result';
import type { AbilityResult } from '../types';

const APPLY_UPDATE_THEME_TOOL_ID = 'big_sky__apply_update_theme';

interface ApplyUpdateThemeInput {
	settings?: unknown;
	styles?: unknown;
	summary?: string;
	toolCallId?: string;
}

/**
 * The `apply-update-theme` ability callback: merges the agent's theme.json
 * `settings` and `styles` into the editor's global styles, after snapshotting
 * the current record so `restore-checkpoint` can undo it.
 */
export async function applyUpdateThemeCallback(
	input: ApplyUpdateThemeInput
): Promise< AbilityResult > {
	const failureMessage = __(
		'Failed to make the theme update. Please try again.',
		__i18n_text_domain__
	);

	const update = normalizeThemeUpdate( input );
	if ( ! update ) {
		return errorResult(
			'Invalid arguments. Provide either settings or styles to update the theme.',
			failureMessage
		);
	}

	// Global styles live in the editor's core-data store — elsewhere the edit
	// would never be saved.
	if ( ! isEditorPage() ) {
		return errorResult( 'The theme can only be updated from the editor.', failureMessage );
	}

	// The post editor does not load the record at boot; reading it starts the
	// fetch, so wait for it rather than fail the first request.
	if ( ! ( await waitForEditedGlobalStyles() ) ) {
		return errorResult( 'Global styles are unavailable to edit.', failureMessage );
	}

	const { summary, toolCallId } = input;
	const successMessage =
		( typeof summary === 'string' && summary.trim() ) ||
		__( 'Theme updated successfully.', __i18n_text_domain__ );

	try {
		await withCheckpoint(
			{
				toolId: APPLY_UPDATE_THEME_TOOL_ID,
				toolCallId,
				keys: THEME_CHECKPOINT_KEYS,
				summary: successMessage,
			},
			() => applyThemeUpdate( update )
		);

		return successResult( successMessage, {
			updatedSettings: !! update.settings,
			updatedStyles: !! update.styles,
		} );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Error applying the theme update:', error );

		return errorResult( error instanceof Error ? error.message : String( error ), failureMessage );
	}
}
