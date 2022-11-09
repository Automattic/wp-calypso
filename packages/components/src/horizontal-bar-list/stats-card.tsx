import classnames from 'classnames';
import React from 'react';
import type { StatsCardProps } from './types';

import './stats-card.scss';

const BASE_CLASS_NAME = 'stats-card';

const StatsCard = ( {
	children,
	className,
	title,
	footerAction,
	isEmpty,
	emptyMessage,
	titleURL,
}: StatsCardProps ) => {
	const baseClass = classnames( className, BASE_CLASS_NAME );
	const titleNode = titleURL ? (
		<a href={ `${ titleURL }` } className={ `${ BASE_CLASS_NAME }--header--title` }>
			{ title }
		</a>
	) : (
		<div className={ `${ BASE_CLASS_NAME }--header--title` }> { title } </div>
	);

	return (
		<div className={ baseClass }>
			{ title && (
				<div className={ `${ BASE_CLASS_NAME }--header` }>
					{ titleNode }
					{ ! isEmpty && <div>Views</div> }
				</div>
			) }
			{ isEmpty && <div className={ `${ BASE_CLASS_NAME }--body-empty` }>{ emptyMessage }</div> }
			{ ! isEmpty && children }
			{ footerAction && (
				<a className={ `${ BASE_CLASS_NAME }--footer` } href={ footerAction?.url }>
					{ footerAction.label || 'View all' }
				</a>
			) }
		</div>
	);
};

export default StatsCard;
