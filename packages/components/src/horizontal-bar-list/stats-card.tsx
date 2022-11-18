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
	metricLabel,
	heroElement,
}: StatsCardProps ) => {
	const translate = useTranslate();

	return (
		<div className={ classNames( className, BASE_CLASS_NAME ) }>
			{ !! heroElement && <div className={ `${ BASE_CLASS_NAME }--hero` }>{ heroElement }</div> }
			<div className={ `${ BASE_CLASS_NAME }--header-and-body` }>
				{ title && (
					<div className={ `${ BASE_CLASS_NAME }--header` }>
						{ titleURL ? (
							<a href={ `${ titleURL }` } className={ `${ BASE_CLASS_NAME }--header--title` }>
								{ title }
							</a>
						) : (
							<div className={ `${ BASE_CLASS_NAME }--header--title` }>{ title }</div>
						) }
						{ ! isEmpty && <div>{ metricLabel ?? translate( 'Views' ) }</div> }
					</div>
				) }
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
