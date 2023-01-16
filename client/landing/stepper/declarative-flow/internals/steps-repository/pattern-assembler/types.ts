export type Pattern = {
	id: number;
	name: string;
	category: string;
	key?: string;
};

export interface NavigatorLocation {
	path: string;
	isInitial: boolean;
}
