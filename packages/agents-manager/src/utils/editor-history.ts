/**
 * The site editor's router history, published by `EditorHistoryBridge` for the
 * `editor-navigate` callback — which, being a plain function, cannot read the
 * React context it comes from.
 *
 * No history means no client-side router, and the callback navigates the whole
 * page instead.
 */

export interface EditorHistory {
	navigate: ( path: string ) => Promise< void >;
}

let editorHistory: EditorHistory | undefined;

export function setEditorHistory( history: EditorHistory | undefined ): void {
	editorHistory = history;
}

export function getEditorHistory(): EditorHistory | undefined {
	return editorHistory;
}
