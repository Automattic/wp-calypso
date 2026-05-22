import type { FirstPostDraft } from './draft-first-post';
import type { InferredContext } from './tailor-launchpad';
import type { GoalKey } from './types';

/**
 * All per-run wizard output lives under one preference key. It used to be
 * six separate keys (goal, intent, site_name, task_ids, inferred,
 * first_post_draft), each saved with its own `savePreference` call — but
 * `savePreference` PUTs a single key while the server echoes back the whole
 * preferences blob, which `receivePreferences` then wholesale-replaces into
 * state. Concurrent saves therefore race: a slow response from an early
 * save can clobber a fast response from a later one. The wizard fires a
 * burst of these per run, which made the first-post draft's subtitle go
 * stale across re-runs. One key means one PUT per write stage, and the
 * three write stages are seconds apart — so no overlap, no race.
 *
 * The global completed-sites list stays its own preference: it's a
 * cross-site list written independently of any single wizard run.
 */
export const HOME_WIZARD_STATE_PREF = 'home_wizard_state';

export type HomeWizardState = {
	goal?: GoalKey;
	// Composed prompt text (goal + name + free-text) sent to Dolly. Stored
	// verbatim so future calls (regenerate, re-tailor) reuse the same source.
	intent?: string;
	siteName?: string;
	// IDs from the most recent `tailor_launchpad` call. Absent when the call
	// timed out / errored / returned empty — the widget then falls back to
	// the deterministic `selectTasks` output.
	taskIds?: string[];
	inferred?: InferredContext;
	// Starter draft from the `draft_first_post` Dolly call. Absent if the
	// call hadn't finished or errored — the first-post row then links to a
	// blank editor instead.
	firstPostDraft?: FirstPostDraft;
	// A theme the user activated via the Launchpad picker. Persisted so the
	// dashboard can mark the "pick-theme" task complete (it has no server-side
	// completion signal — every site always has *some* active theme). This pref
	// is a SINGLE global blob (not per-site), so we record the siteId the pick
	// was made on and only complete the task when it matches the current site —
	// otherwise a new site would inherit a previous site's pick.
	pickedThemeSlug?: string;
	pickedThemeSiteId?: number;
};
