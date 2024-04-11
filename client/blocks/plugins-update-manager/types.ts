export type SyncSuccessParams = {
	plugins: string[];
	frequency: 'daily' | 'weekly';
	hours: number;
	weekday?: number;
};
