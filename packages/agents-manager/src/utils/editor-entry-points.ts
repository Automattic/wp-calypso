import { getAgentsManagerInlineData } from './get-agents-manager-inline-data';
import { isEditorPage } from './is-editor-page';

/**
 * Desktop breakpoint for the editor toolbar entry points, kept in sync with the Help Center
 * button (`apps/help-center/help-center-gutenberg.jsx`), which hides below it on mobile.
 */
const EDITOR_ENTRY_MEDIA_QUERY = '(min-width: 480px)';

/**
 * Whether Gutenberg's "admin bar in editor" (omnibar) experiment is active — it renders a top
 * admin bar in the fullscreen editor. Both signals below are set server-side by Gutenberg core.
 */
export function isAdminBarInEditor(): boolean {
	const hasExperimentFlag = !! ( window as Window & { __experimentalAdminBarInEditor?: boolean } )
		.__experimentalAdminBarInEditor;
	const hasBodyClass = document.body.classList.contains( 'has-admin-bar-in-editor' );

	return hasExperimentFlag || hasBodyClass;
}

/**
 * Whether an editor toolbar entry point can show at all: on a block editor page, on desktop, and
 * with the omnibar off (when it's on, the entries live in the editor admin bar instead). All
 * checks are synchronous, so it's safe to read during render — e.g. from `hasAiChatEntryButton()`.
 */
function isEditorEntryVisible(): boolean {
	return (
		isEditorPage() &&
		window.matchMedia( EDITOR_ENTRY_MEDIA_QUERY ).matches &&
		! isAdminBarInEditor()
	);
}

/**
 * Whether the editor toolbar Ask AI button should show — only in a dev/internal context.
 */
export function isEditorAiEntryEnabled(): boolean {
	return isEditorEntryVisible() && !! getAgentsManagerInlineData()?.isDevMode;
}

/**
 * Whether the editor toolbar Help Center "?" menu should show — only in the unified AI experience.
 */
export function isEditorHelpMenuEnabled(): boolean {
	return isEditorEntryVisible() && !! getAgentsManagerInlineData()?.useUnifiedExperience;
}
