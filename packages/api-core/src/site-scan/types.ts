export interface SiteScan {
	most_recent: {
		timestamp: string;
	};
	reason: string;
	state: 'unavailable' | 'idle';
	threats: Record< string, unknown >[];
}
