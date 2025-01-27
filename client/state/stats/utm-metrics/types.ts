export interface UTMMetricItem {
	label: string;
	value: number;
	children?: Array< UTMMetricItemTopPost >;
	paramValues?: string;
}

export interface UTMMetricItemTopPostRaw {
	id: number;
	title: string;
	views: number;
	href: string;
}

export interface UTMMetricItemTopPost {
	id: number;
	label: string;
	value: number;
	href: string;
	page: string | null;
	actions: Array< { data: string | { [ key: string ]: string }; type: string } >;
}
