import { __ } from '@wordpress/i18n';
import {
	checkpointKeys,
	clearCheckpoint,
	hasCheckpoint,
	setCheckpoint,
} from '../../utils/checkpoints';
import { isEditorPage } from '../../utils/is-editor-page';
import { hasSiteLogoBlock, setSiteLogo } from '../../utils/site-logo';
import { getToolCallIdFromConversationHistory } from '../../utils/tool-call-history';
import { errorResult, successResult } from '../ability-result';
import type { AbilityResult } from '../types';

const SET_SITE_LOGO_TOOL_ID = 'big_sky__set_site_logo';

interface SetSiteLogoInput {
	fileObj?: {
		attachment_id?: string;
		url?: string;
	};
	summary?: string;
}

/**
 * The `set-site-logo` ability callback: points the site's `site_logo` setting
 * at an uploaded attachment, after snapshotting the current logo so
 * `restore-checkpoint` can undo it.
 */
export async function setSiteLogoCallback( input: SetSiteLogoInput ): Promise< AbilityResult > {
	const { fileObj, summary } = input;
	const attachmentId = fileObj?.attachment_id;

	if ( ! attachmentId ) {
		return errorResult( 'A `fileObj` with an `attachment_id` is required.' );
	}

	// The logo lives on the site record, which only the editor's core-data
	// store can edit — elsewhere the edit would never be saved.
	if ( ! isEditorPage() ) {
		return errorResult( 'The site logo can only be set from the editor.' );
	}

	// With no Site Logo block in view, nothing displays the change — say so
	// instead of the model's summary, which assumes the logo became visible.
	const successMessage =
		hasSiteLogoBlock() === false
			? __(
					"I've set your site logo. You won't see it here yet because this view doesn't include a Site Logo block — add one to your header to display it, or ask me to add it for you.",
					__i18n_text_domain__
			  )
			: ( typeof summary === 'string' && summary.trim() ) ||
			  __( 'Logo set successfully.', __i18n_text_domain__ );

	// Keep the first snapshot taken for a tool call: a repeat call must not
	// overwrite the pre-change logo with the one it just set.
	const toolCallId = getToolCallIdFromConversationHistory( SET_SITE_LOGO_TOOL_ID );
	const checkpointId = toolCallId && ! hasCheckpoint( toolCallId ) ? toolCallId : null;

	try {
		if ( checkpointId ) {
			setCheckpoint( checkpointId, [ checkpointKeys.LOGO ], {
				toolId: SET_SITE_LOGO_TOOL_ID,
				summary: successMessage,
			} );
		}

		setSiteLogo( attachmentId );

		return successResult( successMessage, { attachmentId, url: fileObj?.url } );
	} catch ( error ) {
		// A failed edit leaves the logo unchanged — drop the checkpoint so it
		// does not advertise an undo for a change that never happened.
		if ( checkpointId ) {
			clearCheckpoint( checkpointId );
		}

		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Error setting the site logo:', error );

		return errorResult( error instanceof Error ? error.message : String( error ) );
	}
}
