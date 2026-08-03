import { getAgentsManagerInlineData } from './get-agents-manager-inline-data';
import { isEditorPage } from './is-editor-page';

/**
 * Desktop breakpoint for the editor toolbar entry points, kept in sync with the Help Center
 * button (`apps/help-center/help-center-gutenberg.jsx`), which hides below it on mobile.
 */
const EDITOR_ENTRY_MEDIA_QUERY = '(min-width: 480px)';

let adminBarInEditorSnapshot: boolean | undefined;

/**
 * Whether a top admin bar is present in the editor — Gutenberg's "admin bar in editor" (omnibar)
 * experiment, or any context that renders a visible `#wpadminbar`. When it is, the editor toolbar
 * entry points move into the admin bar instead.
 *
 * Snapshotted on first read and kept for the page's lifetime: the signals change as the user
 * toggles editor modes (fullscreen, distraction-free), and the entry points must not hop between
 * the toolbar and the admin bar.
 */
export function isAdminBarInEditor(): boolean {
	if ( adminBarInEditorSnapshot === undefined ) {
		const hasExperimentFlag = !! ( window as Window & { __experimentalAdminBarInEditor?: boolean } )
			.__experimentalAdminBarInEditor;
		const hasBodyClass = document.body.classList.contains( 'has-admin-bar-in-editor' );
		const hasVisibleAdminBar = ( document.getElementById( 'wpadminbar' )?.offsetHeight ?? 0 ) > 0;

		adminBarInEditorSnapshot = hasExperimentFlag || hasBodyClass || hasVisibleAdminBar;
	}

	return adminBarInEditorSnapshot;
}

/**
 * Whether an editor toolbar entry point can show at all: on a block editor page, on desktop, and
 * with the omnibar off (when it's on, the entries live in the editor admin bar instead). All
 * checks are synchronous, so it's safe to read during render — e.g. from `hasAiChatEntryButton()`.
 *
 * Intentionally stays `true` on the Site Editor navigation view, where the toolbar is hidden:
 * the entry `Fill`s must stay registered so the buttons appear once the canvas toolbar mounts.
 * `hasAiChatEntryButton()` excludes that view on its own.
 */
function isEditorEntryVisible(): boolean {
	return (
		isEditorPage() &&
		window.matchMedia( EDITOR_ENTRY_MEDIA_QUERY ).matches &&
		! isAdminBarInEditor()
	);
}

/**
 * Whether the editor toolbar Ask AI button should show. The host only loads the Agents Manager
 * bundle when the feature is enabled, so editor-entry visibility is the only gate left to check here.
 */
export function isEditorAiEntryEnabled(): boolean {
	return isEditorEntryVisible();
}

/**
 * Whether the editor toolbar Help Center "?" menu should show — only in the unified AI experience.
 */
export function isEditorHelpMenuEnabled(): boolean {
	return isEditorEntryVisible() && !! getAgentsManagerInlineData()?.useUnifiedExperience;
}
