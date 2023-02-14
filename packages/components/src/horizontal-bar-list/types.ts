import React from 'react';

export type HorizontalBarListProps = {
	children: React.ReactNode;
	className?: string;
};

export type HorizontalBarListItemProps = {
	data: StatDataObject;
	maxValue: number;
	url?: string;
	onClick?: ( e: React.MouseEvent | React.KeyboardEvent, data: StatDataObject ) => void;
	hasIndicator?: boolean;
	leftSideItem?: React.ReactNode | HTMLElement | undefined;
	renderRightSideItem?: ( data: StatDataObject ) => React.ReactNode;
	useShortLabel?: boolean;
	useShortNumber?: boolean;
	isStatic?: boolean;
	additionalColumns?: React.ReactNode;
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
	title: string;
	titleURL: string;
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
