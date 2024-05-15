export type MultiSiteSuccessParams = {
	sites_count: number;
	plugins_number: number;
	frequency: 'daily' | 'weekly';
	hours: number;
	weekday?: number;
};
