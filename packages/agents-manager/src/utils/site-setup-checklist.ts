import { __, sprintf } from '@wordpress/i18n';
import { isEditorPage } from './is-editor-page';
import { markNextPromptSource } from './prompt-source';
import type { SiteSetupTask } from './site-setup-tasks';
import type { UIMessage } from '@automattic/agenttic-client';
import type { ChecklistItem } from '@automattic/agenttic-ui';

/** `clientContext.metadata.promptSource` of a task's prompt: marks the chat as started from the list. */
export const SITE_SETUP_PROMPT_SOURCE = 'site-setup-checklist';

// Query-string toggle, like `?am_credits`: the only way in until the rollout
// gate is decided. Nothing is fetched without it.
const TOGGLE_PARAM = 'am_setup_checklist';

/**
 * Whether the chat shows the Site Setup checklist: only in the block editor,
 * where the Site Setup ability runs, and only with the query-string toggle.
 */
export function isSiteSetupChecklistEnabled(): boolean {
	if ( ! isEditorPage() || typeof window === 'undefined' ) {
		return false;
	}

	return new URLSearchParams( window.location.search ).has( TOGGLE_PARAM );
}

export function siteSetupTaskPrompt( task: SiteSetupTask ): string {
	return sprintf(
		/* translators: %s: the title of a Site Setup task */
		__( 'Help me with this Site Setup task: %s', __i18n_text_domain__ ),
		task.title
	);
}

/**
 * Maps Site Setup tasks to checklist items. Status is the server's, so the
 * chat and the Site Setup page always agree. The item's `action` only declares
 * where the prompt comes from, which the sent message then carries; the pick is
 * recorded on the server from that message, once it is in the conversation, so
 * a send the composer blocks or drops changes nothing. A task in progress
 * sends the same prompt again, to resume it with the agent.
 */
export function toChecklistItems( tasks: SiteSetupTask[] ): ChecklistItem[] {
	return tasks.map( ( task ) => {
		const prompt = siteSetupTaskPrompt( task );

		return {
			id: task.id,
			label: task.title,
			status: task.status,
			prompt,
			autoSubmit: true,
			disabled: task.disabled,
			action: () => {
				markNextPromptSource( { source: SITE_SETUP_PROMPT_SOURCE, id: task.id }, prompt );
				return true;
			},
		};
	} );
}

/**
 * Whether the conversation was started from the checklist: a user message
 * that came from it, live or restored. Decides where the list renders; a
 * task's status never derives from it.
 */
export function isChatStartedFromSiteSetup( messages: UIMessage[] ): boolean {
	return messages.some(
		( message ) =>
			message.role === 'user' &&
			message.content.some(
				( content ) =>
					content.type === 'data' && content.data?.promptSource === SITE_SETUP_PROMPT_SOURCE
			)
	);
}

/** The task a user message picked from the checklist, or `null` when it did not come from it with a task id. */
export function getPickedSiteSetupTask( message: UIMessage ): string | null {
	if ( message.role !== 'user' ) {
		return null;
	}
	for ( const content of message.content ) {
		if (
			content.type === 'data' &&
			content.data?.promptSource === SITE_SETUP_PROMPT_SOURCE &&
			typeof content.data.promptSourceId === 'string' &&
			content.data.promptSourceId
		) {
			return content.data.promptSourceId;
		}
	}
	return null;
}

/**
 * The task the user picked last, from the newest user message that came from
 * the checklist with a task id; `null` when none did.
 */
export function getLastPickedSiteSetupTask( messages: UIMessage[] ): string | null {
	for ( let index = messages.length - 1; index >= 0; index-- ) {
		const taskId = getPickedSiteSetupTask( messages[ index ] );
		if ( taskId !== null ) {
			return taskId;
		}
	}
	return null;
}
