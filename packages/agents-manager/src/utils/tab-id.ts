import { generateUUID } from './generate-uuid';

const TAB_ID_KEY = 'agents-manager-tab-id';

let memoryTabId = '';

/**
 * A stable id for this browser tab, generated on first use and kept in
 * `sessionStorage`, so it survives navigation within the tab and dies with it.
 *
 * The chat's session id is assigned by the server on the first reply, so the
 * events before it (chat open, suggestions, the first send) have none. They
 * carry the tab id instead, which the conversation's later events repeat, so
 * the two halves can be joined.
 *
 * A duplicated tab copies `sessionStorage`, so it shares the id. It also
 * copies the chat's session (see `agent-session.ts`) and resumes the same
 * conversation, so the two ids stay in step.
 */
export function getTabId(): string {
	try {
		const stored = sessionStorage.getItem( TAB_ID_KEY );
		if ( stored ) {
			return stored;
		}
		const tabId = generateUUID();
		sessionStorage.setItem( TAB_ID_KEY, tabId );
		return tabId;
	} catch {
		// Storage unavailable: still one id per page load.
		memoryTabId ||= generateUUID();
		return memoryTabId;
	}
}
