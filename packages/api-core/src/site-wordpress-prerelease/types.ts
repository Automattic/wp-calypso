export interface WordPressPrerelease {
	/** Whether the site was put on the beta track by the automatic enrollment, not by its owner. */
	auto_enrolled: boolean;
	/** The pre-release the beta track serves, e.g. "7.2-beta2" or "7.2-RC1". */
	version: string;
	/** The planned release date of that version, as `YYYY-MM-DD`. */
	release_date: string;
}
