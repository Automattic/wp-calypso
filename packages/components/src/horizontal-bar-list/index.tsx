import clsx from 'clsx';
import React from 'react';
import type { HorizontalBarListProps } from './types';

import './style.scss';

const BASE_CLASS_NAME = 'horizontal-bar-list';

const HorizontalBarList = ( { children, className }: HorizontalBarListProps ) => {
	const baseClass = clsx( className, BASE_CLASS_NAME );

	return <ul className={ baseClass }>{ children }</ul>;
};

export default HorizontalBarList;
export { HorizontalBarList };
export { default as HorizontalBarListItem } from './horizontal-bar-grid-item';
export { default as StatsCard } from './stats-card';
export { default as StatsCardAvatar } from './sideElements/avatar';
export { default as StatsCardTitleExtras } from './title-extras';
