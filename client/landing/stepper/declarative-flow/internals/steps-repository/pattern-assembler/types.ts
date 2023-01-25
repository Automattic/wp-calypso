export type Pattern = {
	id: number;
	name: string;
	category?: string;
	categories?: string;
	key?: string;
};

export type Category = {
	name: string;
	label: string;
	description: string;
};

export interface NavigatorLocation {
	path: string;
	isInitial: boolean;
}
