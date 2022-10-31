import classnames from 'classnames';
import React from 'react';
import type { HorizontalBarListProps } from './types';

import './style.scss';

const BASE_CLASS_NAME = 'horizontal-bar-list';

const HorizontalBarList = ( { children, className }: HorizontalBarListProps ) => {
	const baseClass = classnames( className, BASE_CLASS_NAME );

	return <ul className={ baseClass }>{ children }</ul>;
};

export default HorizontalBarList;
