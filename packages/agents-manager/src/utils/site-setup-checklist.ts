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
 * Maps Site Setup tasks to checklist items. A task the user picked from the
 * list stays `in-progress` until the server reports it done or skipped. The
 * item's `action` runs before its prompt is sent and declares where the prompt
 * comes from, which the sent message then carries.
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
				markNextPromptSource( { source: SITE_SETUP_PROMPT_SOURCE, id: task.id }, prompt );
				return true;
			},
		};
	} );
}

/**
 * The tasks the conversation says were picked from the checklist: `null` when
 * no user message came from it, otherwise their ids (empty for messages stored
 * without one, which still mark the chat as started from the list).
 */
export function getSiteSetupStartedTasks( messages: UIMessage[] ): ReadonlySet< string > | null {
	let started = false;
	const ids = new Set< string >();

	for ( const message of messages ) {
		if ( message.role !== 'user' ) {
			continue;
		}
		for ( const content of message.content ) {
			if ( content.type !== 'data' || content.data?.promptSource !== SITE_SETUP_PROMPT_SOURCE ) {
				continue;
			}
			started = true;
			if ( typeof content.data.promptSourceId === 'string' && content.data.promptSourceId ) {
				ids.add( content.data.promptSourceId );
			}
		}
	}

	return started ? ids : null;
}
