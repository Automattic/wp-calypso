export interface AddNewSiteProps {
	context?: 'sites-dashboard' | 'ciab-sites-dashboard' | 'unknown';
	/**
	 * Target path for the "Create with AI" menu item. Parents should pass this
	 * in so the underlying `useExperiment` call fires on page mount rather
	 * than when the popover opens, avoiding a click-before-fetch race. The
	 * pre-experiment AI Builder flow is used as a defensive fallback for
	 * dynamic callers (e.g. `AsyncLoad`) that can't satisfy the prop type
	 * at compile time.
	 */
	aiSiteBuilderPath?: string;
}
