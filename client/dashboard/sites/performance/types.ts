export type DeviceToggleType = 'mobile' | 'desktop';

type PerformanceMetricsDetailsHeading = {
	key: string;
	label: string;
	valueType: string;
	subItemsHeading?: { key: string; valueType?: string };
};

type PerformanceMetricsDetailsItemObject = {
	location?: {
		url: string;
		line: number;
		column: number;
	};
} & Record< string, string | number >;

type PerformanceMetricsDetailsSubItemObject = {
	items: Record< string, string | number >[];
	type: 'subitems';
} & Record< string, string | number >;

export type PerformanceMetricsDetailsItem = {
	subItems?: PerformanceMetricsDetailsSubItemObject;
} & Record<
	string,
	| string
	| number
	| boolean
	| PerformanceMetricsDetailsItemObject
	| PerformanceMetricsDetailsSubItemObject
>;

export interface PerformanceMetricsDetailsQueryResponse {
	type: 'table' | 'opportunity' | 'list' | 'criticalrequestchain';
	headings?: PerformanceMetricsDetailsHeading[];
	items?: PerformanceMetricsDetailsItem[];
	chains?: Record< string, unknown >[];
	isEntityGrouped?: boolean;
}

export interface PerformanceMetricsItemQueryResponse {
	id: string;
	title?: string;
	description?: string;
	type: 'warning' | 'fail';
	displayValue?: string;
	details?: PerformanceMetricsDetailsQueryResponse;
	metricSavings?: { FCP?: number; LCP?: number; CLS?: number; INP?: number };
}
