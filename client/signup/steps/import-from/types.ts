export type Importer = 'wix' | 'medium';
export type QueryObject = {
	from: string;
	to: string;
};

export interface ImportJob {
	importerId: string;
	importerState: string;
	type: string;
	site: { ID: number };
	customData: { [ key: string ]: any };
	errorData: {
		type: string;
		description: string;
	};
	progress: {
		page: { completed: number; total: number };
		post: { completed: number; total: number };
		comment: { completed: number; total: number };
		attachment: { completed: number; total: number };
	};
}
