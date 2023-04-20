export type Pattern = {
	ID: number;
	name: string;
	title: string;
	description?: string;
	category?: Category;
	categories: {
		[ key: string ]: Category | undefined;
	};
	key?: string;
	pattern_meta?: {
		[ key: string ]: boolean;
	};
};

export interface NavigatorLocation {
	path: string;
	isInitial: boolean;
}

export type Category = {
	name?: string;
	slug?: string;
	label?: string;
	description?: string;
};
