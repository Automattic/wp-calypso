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
	title: string;
	subtitle: string;
	url?: string;
	icon?: string;
	color?: string;
	blogId?: number;
	isDotcomSite?: boolean;
}

export interface PreviewPaneProps {
	itemData: ItemData;
	closeItemPreviewPane?: () => void;
	selectedFeatureId?: string;
	features?: FeaturePreviewInterface[];
	className?: string;
	isSmallScreen?: boolean;
	hasError?: boolean;
	addTourDetails?: { id: string; tourId: string };
}
