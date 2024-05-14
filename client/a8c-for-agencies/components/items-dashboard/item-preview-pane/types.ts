import React from 'react';
import { TourId } from 'calypso/a8c-for-agencies/data/guided-tours/use-guided-tours';

export interface FeaturePreviewInterface {
	id: string;
	tab: FeatureTabInterface;
	preview?: React.ReactNode;
	enabled?: boolean;
}

export interface FeatureTabInterface {
	label: string | React.ReactNode;
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
	adminUrl?: string;
}

export interface PreviewPaneProps {
	itemData: ItemData;
	closeItemPreviewPane?: () => void;
	selectedFeatureId?: string;
	features?: FeaturePreviewInterface[];
	className?: string;
	isSmallScreen?: boolean;
	hasError?: boolean;
	addTourDetails?: { id: string; tourId: TourId };
	itemPreviewPaneHeaderExtraProps?: ItemPreviewPaneHeaderExtraProps;
}

export interface ItemPreviewPaneHeaderExtraProps {
	externalIconSize?: number;
	siteIconFallback?: 'color' | 'wordpress-logo' | 'first-grapheme';
	headerButtons?: React.ComponentType< {
		focusRef: React.RefObject< HTMLButtonElement >;
		itemData: ItemData;
		closeSitePreviewPane: () => void;
	} >;
}
