import classnames from 'classnames';
import React from 'react';
import type { StatsCardProps } from './types';

import './stats-card.scss';

const BASE_CLASS_NAME = 'stats-card';

const StatsCard = ( { children, className, title, showMore }: StatsCardProps ) => {
	const baseClass = classnames( className, BASE_CLASS_NAME );

	return (
		<div className={ baseClass }>
			{ title && (
				<div className={ `${ BASE_CLASS_NAME }--header` }>
					<div className={ `${ BASE_CLASS_NAME }--header--title` }> { title } </div>
					<div>Views</div>
				</div>
			) }
			{ children }
			{ showMore && (
				<a className={ `${ BASE_CLASS_NAME }--footer` } href={ showMore?.url }>
					{ showMore.label || 'View all' }
				</a>
			) }
		</div>
	);
};

export default StatsCard;
