import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import type { StatsCardProps } from './types';

import './stats-card.scss';

const BASE_CLASS_NAME = 'stats-card';

// This component is mainly used for the Locations module, which uses heroElement, splitHeader and toggleControl
const StatsHeroCard = ( {
	children,
	className,
	title,
	titleURL,
	titleAriaLevel = 4,
	titleNodes,
	footerAction,
	isEmpty,
	emptyMessage,
	heroElement,
	metricLabel,
	mainItemLabel,
	additionalHeaderColumns,
	toggleControl,
	headerClassName,
	overlay,
}: StatsCardProps ) => {
	const translate = useTranslate();

	const titleNode = titleURL ? (
		<a href={ `${ titleURL }` } className={ `${ BASE_CLASS_NAME }-header__title` }>
			{ title }
		</a>
	) : (
		<div
			className={ `${ BASE_CLASS_NAME }-header__title` }
			role="heading"
			aria-level={ titleAriaLevel }
		>
			<div>{ title }</div>
			<div className={ `${ BASE_CLASS_NAME }-header__title-nodes` }>{ titleNodes }</div>
		</div>
	);

	// Column header node for split header
	const columnHeaderNode = (
		<div className={ `${ BASE_CLASS_NAME }--column-header` }>
			<div className={ `${ BASE_CLASS_NAME }--column-header__left` } key="left">
				{ mainItemLabel }
				{ additionalHeaderColumns && (
					<div className={ `${ BASE_CLASS_NAME }-header__additional` }>
						{ additionalHeaderColumns }
					</div>
				) }
			</div>
			{ ! isEmpty && (
				<div className={ `${ BASE_CLASS_NAME }--column-header__right` } key="right">
					{ metricLabel ?? translate( 'Views' ) }
				</div>
			) }
		</div>
	);

	return (
		<div
			className={ clsx( className, BASE_CLASS_NAME, {
				[ `${ BASE_CLASS_NAME }__hasoverlay` ]: !! overlay,
			} ) }
		>
			<div
				className={ `${ BASE_CLASS_NAME }-header ${ headerClassName } ${ BASE_CLASS_NAME }-header--split` }
			>
				<div className={ `${ BASE_CLASS_NAME }-header--main` }>
					{ titleNode }
					{ toggleControl }
				</div>
			</div>
			<div className={ `${ BASE_CLASS_NAME }__content` }>
				<div className={ `${ BASE_CLASS_NAME }--hero` }>{ heroElement }</div>
				<div className={ `${ BASE_CLASS_NAME }--header-and-body` }>
					<div
						className={ clsx( `${ BASE_CLASS_NAME }--body`, {
							[ `${ BASE_CLASS_NAME }--body-empty` ]: isEmpty,
						} ) }
					>
						{ columnHeaderNode }
						{ isEmpty ? emptyMessage : children }
					</div>
					{ footerAction && (
						<a
							className={ `${ BASE_CLASS_NAME }--footer` }
							href={ footerAction?.url }
							aria-label={
								translate( 'View all %(title)s', {
									args: { title: title.toLocaleLowerCase?.() ?? title.toLowerCase() },
									comment: '"View all posts & pages", "View all referrers", etc.',
								} ) as string
							}
						>
							{ footerAction.label || translate( 'View all' ) }
						</a>
					) }
				</div>
			</div>
			{ overlay && <div className={ `${ BASE_CLASS_NAME }__overlay` }>{ overlay }</div> }
		</div>
	);
};

export default StatsHeroCard;
