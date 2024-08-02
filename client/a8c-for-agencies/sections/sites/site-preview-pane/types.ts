import React from 'react';
import { Site } from '../types';

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

export interface PreviewPaneProps {
	site: Site;
	closeSitePreviewPane?: () => void;
	selectedSiteFeature?: string;
	setSelectedSiteFeature: ( id: string ) => void;
	features?: FeaturePreviewInterface[];
	className?: string;
	isSmallScreen?: boolean;
	hasError?: boolean;
	onRefetchSite?: () => Promise< unknown >;
}
