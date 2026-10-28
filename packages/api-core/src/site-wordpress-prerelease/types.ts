export interface WordPressPrerelease {
	/** The upcoming WordPress version, e.g. "7.2". */
	version: string;
	/** Whether the site was picked for early access to that version. */
	enrolled_this_cycle: boolean;
	/** Whether the owner asked for the site not to be picked again. */
	opted_out: boolean;
}
