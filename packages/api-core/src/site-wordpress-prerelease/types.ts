export interface WordPressPrerelease {
	/** Whether the site was put on the beta track by the automatic enrollment, not by its owner. */
	auto_enrolled: boolean;
	/** The upcoming WordPress version, e.g. "7.2". */
	version: string;
	stage: 'beta' | 'rc';
	/** The planned release date of that version, as `YYYY-MM-DD`. */
	release_date: string;
}
