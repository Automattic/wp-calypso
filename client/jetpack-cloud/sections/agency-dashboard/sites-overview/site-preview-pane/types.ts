import React from 'react';
import { Site } from '../types';

export interface FeaturePreviewInterface {
	id: string;
	tab: FeatureTabInterface;
	preview?: React.ReactNode;
}

export interface FeatureTabInterface {
	label: string;
	countValue?: number;
	countColor?: string;
	selected?: boolean;
	enabled?: boolean;
	onTabClick?: () => void;
}

export interface SitePreviewPaneProps {
	site: Site;
	closeSitePreviewPane?: () => void;
	selectedFeatureId?: string;
	features?: FeaturePreviewInterface[];
}
