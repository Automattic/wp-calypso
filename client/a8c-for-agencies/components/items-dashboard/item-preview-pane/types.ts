import React from 'react';

export interface FeaturePreviewInterface {
	id: string;
	tab: FeatureTabInterface;
	preview?: React.ReactNode;
	enabled?: boolean;
}

export interface FeatureTabInterface {
	label: string;
	countValue?: number;
	countColor?: string;
	selected?: boolean;
	visible?: boolean;
	onTabClick?: () => void;
}

export interface ItemData {
	itemTitle: string;
	itemSubtitle: string;
	itemUrl?: string;
	itemIcon?: string;
	itemColor?: string;
}

export interface PreviewPaneProps extends ItemData {
	closeSitePreviewPane?: () => void;
	selectedFeatureId?: string;
	features?: FeaturePreviewInterface[];
	className?: string;
	isSmallScreen?: boolean;
	hasError?: boolean;
}
