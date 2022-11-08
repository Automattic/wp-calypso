import React from 'react';

export type HorizontalBarListProps = {
	children: React.ReactNode;
	className?: string;
};

export type HorizontalBarListItemProps = {
	data: StatDataObject;
	maxValue: number;
	url?: string;
	onClick?: ( e: React.MouseEvent | React.KeyboardEvent ) => void;
	hasIndicator?: boolean;
	leftSideItem?: React.ReactNode | HTMLElement | undefined;
	rightSideItem?: React.ReactNode | HTMLElement;
	useShortLabel?: boolean;
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
};
