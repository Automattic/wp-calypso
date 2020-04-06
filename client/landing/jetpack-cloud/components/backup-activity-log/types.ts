// based on the how filters are used in client/state/data-getters/index.js
export interface Filter {
	after?: string;
	aggregate?: boolean;
	before?: string;
	group?: Array< string >;
	on?: string;
	page: number;
}

// TODO: fill this out
export interface Activity {
	activityId: string;
}

export interface ActivityTypeCount {
	count: number;
	key: string;
	name: StringConstructor;
}
