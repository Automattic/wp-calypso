import { __ } from '@wordpress/i18n';
import { checkpointKeys, withCheckpoint } from '../../utils/checkpoints';
import { isEditorPage } from '../../utils/is-editor-page';
import { hasSiteLogoBlock, setSiteLogo } from '../../utils/site-logo';
import { errorResult, successResult } from '../ability-result';
import type { AbilityResult } from '../types';

const SET_SITE_LOGO_TOOL_ID = 'big_sky__set_site_logo';

interface SetSiteLogoInput {
	fileObj?: {
		attachment_id?: string;
		url?: string;
	};
	summary?: string;
	toolCallId?: string;
}

/**
 * The `set-site-logo` ability callback: points the site's `site_logo` setting
 * at an uploaded attachment, after snapshotting the current logo so
 * `restore-checkpoint` can undo it.
 */
export async function setSiteLogoCallback( input: SetSiteLogoInput ): Promise< AbilityResult > {
	const { fileObj, summary, toolCallId } = input;
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

	try {
		await withCheckpoint(
			{
				toolId: SET_SITE_LOGO_TOOL_ID,
				toolCallId,
				keys: [ checkpointKeys.LOGO ],
				summary: successMessage,
			},
			() => setSiteLogo( attachmentId )
		);

		return successResult( successMessage, { attachmentId, url: fileObj?.url } );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Error setting the site logo:', error );

		return errorResult( error instanceof Error ? error.message : String( error ) );
	}
}
