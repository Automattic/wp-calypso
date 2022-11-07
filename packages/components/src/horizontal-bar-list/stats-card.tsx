import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import type { StatsCardProps } from './types';

import './stats-card.scss';

const BASE_CLASS_NAME = 'stats-card';

const StatsCard = ( {
	children,
	className,
	title,
	titleURL,
	footerAction,
	isEmpty,
	emptyMessage,
	metricLabel,
}: StatsCardProps ) => {
	const translate = useTranslate();
	const baseClass = classnames( className, BASE_CLASS_NAME );
	const columnLaebl = metricLabel ?? translate( 'Views' );
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
					{ ! isEmpty && <div> { columnLaebl } </div> }
				</div>
			) }
			{ isEmpty && <div className={ `${ BASE_CLASS_NAME }--body-empty` }>{ emptyMessage }</div> }
			{ ! isEmpty && children }
			{ footerAction && (
				<a className={ `${ BASE_CLASS_NAME }--footer` } href={ footerAction?.url }>
					{ footerAction.label || translate( 'View all' ) }
				</a>
			) }
		</div>
	);
};

export default StatsCard;
