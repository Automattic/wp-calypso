import { __, sprintf } from '@wordpress/i18n';
import { getAgentsManagerInlineData } from './get-agents-manager-inline-data';
import { isEditorPage } from './is-editor-page';
import { markNextPromptSource } from './prompt-source';
import type { SiteSetupTask } from './site-setup-tasks';
import type { UIMessage } from '@automattic/agenttic-client';
import type { ChecklistItem } from '@automattic/agenttic-ui';

/** `clientContext.metadata.promptSource` of a task's prompt: marks the chat as started from the list. */
export const SITE_SETUP_PROMPT_SOURCE = 'site-setup-checklist';

// Query-string override for sandboxes, like `?am_credits`.
const DEV_TOGGLE_PARAM = 'am_setup_checklist';

/**
 * Whether the chat shows the Site Setup checklist: the host flag (or the dev
 * toggle), and only in the block editor, where the Site Setup ability reads
 * the site's own REST route.
 */
export function isSiteSetupChecklistEnabled(): boolean {
	if ( ! isEditorPage() ) {
		return false;
	}

	if ( getAgentsManagerInlineData()?.siteSetupChecklist === true ) {
		return true;
	}

	if ( typeof window === 'undefined' ) {
		return false;
	}

	return new URLSearchParams( window.location.search ).has( DEV_TOGGLE_PARAM );
}

export function siteSetupTaskPrompt( task: SiteSetupTask ): string {
	return sprintf(
		/* translators: %s: the title of a Site Setup task */
		__( 'Help me with this Site Setup task: %s', __i18n_text_domain__ ),
		task.title
	);
}

/**
 * Maps Site Setup tasks to checklist items. A task the user picked from the
 * list stays `in-progress` until the server reports it done or skipped. The
 * item's `action` runs before its prompt is sent and declares the prompt
 * source the server stores on that message.
 */
export function toChecklistItems(
	tasks: SiteSetupTask[],
	startedIds: ReadonlySet< string >
): ChecklistItem[] {
	return tasks.map( ( task ) => {
		const prompt = siteSetupTaskPrompt( task );

		return {
			id: task.id,
			label: task.title,
			status: task.status === 'todo' && startedIds.has( task.id ) ? 'in-progress' : task.status,
			prompt,
			autoSubmit: true,
			disabled: task.disabled,
			action: () => {
				markNextPromptSource( SITE_SETUP_PROMPT_SOURCE, prompt );
				return true;
			},
		};
	} );
}

/** Whether a user message in the conversation was sent from the checklist. */
export function isSiteSetupChat( messages: UIMessage[] ): boolean {
	return messages.some(
		( message ) =>
			message.role === 'user' &&
			message.content.some(
				( content ) =>
					content.type === 'data' && content.data?.promptSource === SITE_SETUP_PROMPT_SOURCE
			)
	);
}
