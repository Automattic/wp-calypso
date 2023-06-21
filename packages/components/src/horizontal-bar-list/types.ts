import React from 'react';

export type HorizontalBarListProps = {
	children: React.ReactNode;
	className?: string;
};

export type HorizontalBarListItemProps = {
	data: StatDataObject;
	className?: string;
	maxValue: number;
	url?: string;
	onClick?: ( e: React.MouseEvent | React.KeyboardEvent, data: StatDataObject ) => void;
	hasIndicator?: boolean;
	leftSideItem?: React.ReactNode | undefined;
	renderLeftSideItem?: ( data: StatDataObject ) => React.ReactNode | undefined;
	renderRightSideItem?: ( data: StatDataObject ) => React.ReactNode;
	useShortLabel?: boolean;
	useShortNumber?: boolean;
	leftGroupToggle?: boolean;
	isStatic?: boolean;
	additionalColumns?: React.ReactNode;
	// for values that are not numeric, add this property to display a string in the values column and avoid showing horizontal bars
	usePlainCard?: boolean;
	// use underlined links for item lables (variants without horizontal bars)
	isLinkUnderlined?: boolean;
};

type StatDataObject = {
	id?: string;
	label: string;
	value: number;
	page?: string;
	actions?: Array< StatsActions >;
	iconClassName?: string;
	icon?: string;
	children?: Array< StatDataObject >;
	className?: string;
	link?: string;
	labelIcon?: string;
	actionMenu?: number;
	countryCode?: string;
	region?: string;
	public?: boolean;
	shortLabel?: string;
};

type StatsActions = {
	data: string;
	type: string;
};

export type StatsCardProps = {
	children: React.ReactNode;
	className?: string;
	headerClassName?: string;
	title: string;
	titleURL: string;
	titleAriaLevel?: number;
	footerAction?: {
		label?: string;
		url?: string;
	};
	isEmpty?: boolean;
	emptyMessage?: string;
	metricLabel?: string;
	heroElement?: React.ReactNode;
	splitHeader?: boolean;
	mainItemLabel?: React.ReactNode;
	additionalHeaderColumns?: React.ReactNode;
	toggleControl?: React.ReactNode;
};

export type StatsCardAvatarProps = {
	url: string;
	altName?: string;
};
