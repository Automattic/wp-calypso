import classNames from 'classnames';
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
	heroElement,
	splitHeader,
	metricLabel,
	mainItemLabel,
	additionalHeaderColumns,
}: StatsCardProps ) => {
	const translate = useTranslate();

	const titleNode = titleURL ? (
		<a href={ `${ titleURL }` } className={ `${ BASE_CLASS_NAME }--header--title` }>
			{ title }
		</a>
	) : (
		<div className={ `${ BASE_CLASS_NAME }--header--title` }>{ title }</div>
	);

	// On one line shows card title and value column header
	const simpleHeaderNode = (
		<div className={ `${ BASE_CLASS_NAME }--header` }>
			{ titleNode }
			{ ! isEmpty && <div>{ metricLabel ?? translate( 'Views' ) }</div> }
		</div>
	);

	// Show Card title on one line and all other column header(s) below:
	// (main item, optional additional columns and value)
	const splitHeaderNode = (
		<div className={ `${ BASE_CLASS_NAME }--header ${ BASE_CLASS_NAME }--header--split` }>
			{ titleNode }
			<div className={ `${ BASE_CLASS_NAME }--column-header` }>
				<div className={ `${ BASE_CLASS_NAME }--column-header-left` }>
					{ splitHeader && mainItemLabel }
					{ additionalHeaderColumns && (
						<div className={ `${ BASE_CLASS_NAME }--header--additional` }>
							{ additionalHeaderColumns }
						</div>
					) }
				</div>
				{ ! isEmpty && (
					<div className={ `${ BASE_CLASS_NAME }--column-header-right` }>
						{ metricLabel ?? translate( 'Views' ) }
					</div>
				) }
			</div>
		</div>
	);

	return (
		<div className={ classNames( className, BASE_CLASS_NAME ) }>
			{ !! heroElement && <div className={ `${ BASE_CLASS_NAME }--hero` }>{ heroElement }</div> }
			<div className={ `${ BASE_CLASS_NAME }--header-and-body` }>
				{ splitHeader ? splitHeaderNode : simpleHeaderNode }
				<div
					className={ classNames( `${ BASE_CLASS_NAME }--body`, {
						[ `${ BASE_CLASS_NAME }--body-empty` ]: isEmpty,
					} ) }
				>
					{ isEmpty ? emptyMessage : children }
				</div>
			</div>
			{ footerAction && (
				<a className={ `${ BASE_CLASS_NAME }--footer` } href={ footerAction?.url }>
					{ footerAction.label || translate( 'View all' ) }
				</a>
			) }
		</div>
	);
};

export default StatsCard;
