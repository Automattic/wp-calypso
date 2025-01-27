import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import type { StatsCardProps } from './types';

import './stats-card.scss';

const BASE_CLASS_NAME = 'stats-card';

const StatsCard = ( {
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
	splitHeader,
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

	// On one line shows card title and value column header
	const simpleHeaderNode = (
		<div className={ clsx( `${ BASE_CLASS_NAME }-header`, headerClassName ) }>
			{ titleNode }
			{ ! isEmpty && <div>{ metricLabel ?? translate( 'Views' ) }</div> }
		</div>
	);

	// Show Card title on one line and all other column header(s) below:
	// (main item, optional additional columns and value)
	const splitHeaderNode = (
		<div
			className={ `${ BASE_CLASS_NAME }-header ${ headerClassName } ${ BASE_CLASS_NAME }-header--split` }
		>
			<div className={ `${ BASE_CLASS_NAME }-header--main` }>
				{ ! heroElement && titleNode }
				{ toggleControl }
			</div>
			{ ! isEmpty && (
				<div className={ `${ BASE_CLASS_NAME }--column-header` }>
					<div className={ `${ BASE_CLASS_NAME }--column-header__left` } key="left">
						{ splitHeader && mainItemLabel }
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
			) }
		</div>
	);

	return (
		<div
			className={ clsx( className, BASE_CLASS_NAME, {
				[ `${ BASE_CLASS_NAME }__hasoverlay` ]: !! overlay,
			} ) }
		>
			<div className={ `${ BASE_CLASS_NAME }__content` }>
				{ !! heroElement && (
					<div className={ `${ BASE_CLASS_NAME }--hero` }>
						{ splitHeader && <div className={ `${ BASE_CLASS_NAME }-header` }>{ titleNode }</div> }
						{ heroElement }
					</div>
				) }
				<div className={ `${ BASE_CLASS_NAME }--header-and-body` }>
					{ splitHeader ? splitHeaderNode : simpleHeaderNode }
					<div
						className={ clsx( `${ BASE_CLASS_NAME }--body`, {
							[ `${ BASE_CLASS_NAME }--body-empty` ]: isEmpty,
						} ) }
					>
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

export default StatsCard;
