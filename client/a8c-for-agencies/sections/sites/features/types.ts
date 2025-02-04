import { FeaturePreviewInterface } from '../site-preview-pane/types';

export interface FeatureColumnInfo {
	label: string;
	render: React.ReactNode;
	disabled?: boolean;
}

export interface FeatureFamily {
	id: string;
	label: string;
	columns?: FeatureColumnInfo[];
	filters?: object;
	bulkActions?: object;
	features?: FeaturePreviewInterface[];
	emptyState?: React.ReactNode;
}
