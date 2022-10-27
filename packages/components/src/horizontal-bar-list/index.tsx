import classnames from 'classnames';
import React from 'react';
import type { HorizontalBarListProps } from './types';

import './style.scss';

const BASE_CLASS_NAME = 'horizontal-bar-list';

const HorizontalBarList = ( { children, className, data }: HorizontalBarListProps ) => {
	if ( ! data || ! data.length ) {
		//TODO: handle loading indicator
		return <div>No data</div>; // This will come from a prop to handle different message.
	}

	const baseClass = classnames( className, BASE_CLASS_NAME );

	return <ul className={ baseClass }>{ children }</ul>;
};

export default HorizontalBarList;
