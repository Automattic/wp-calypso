export interface AddNewSiteProps {
	context?: 'sites-dashboard' | 'ciab-sites-dashboard' | 'unknown';
	/**
	 * Target path for the "Create with AI" menu item. Provided by the parent
	 * so the underlying `useExperiment` call fires on page mount rather than
	 * when this popover is first opened, avoiding a click-before-fetch race.
	 */
	aiSiteBuilderPath: string;
}
