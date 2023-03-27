export type Pattern = {
	ID: number;
	name: string;
	title: string;
	category?: Category;
	categories: { [ key: string ]: Category };
	key?: string;
};

export interface NavigatorLocation {
	path: string;
	isInitial: boolean;
}

export type Category = {
	slug?: string;
	name?: string;
	label: string;
	description: string;
};
