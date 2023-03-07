export type Pattern = {
	id: number;
	name: string;
	category?: Category;
	categories: string[];
	key?: string;
};

export interface NavigatorLocation {
	path: string;
	isInitial: boolean;
}

export type Category = {
	name: string;
	label: string;
	description: string;
};
