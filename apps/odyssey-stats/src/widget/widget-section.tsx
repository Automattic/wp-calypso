import { Card, CardBody, CardHeader } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { ComponentProps, FunctionComponent, ReactNode } from 'react';

import './widget-section.scss';

interface WidgetSectionProps {
	/** Names the section. Rendered as the heading beneath the widget's own postbox title. */
	title: string;
	/** Optional control shown opposite the title, such as the date range dropdown. */
	action?: ReactNode;
	/** Optional icon shown before the title. */
	icon?: ComponentProps< typeof Icon >[ 'icon' ];
	className?: string;
	children: ReactNode;
}

/**
 * The frame every widget section shares: a card with a title and an optional control.
 *
 * There is no footer slot: Highlights' "See more" changes with the selected tab, so
 * trailing links stay with each section's children.
 */
const WidgetSection: FunctionComponent< WidgetSectionProps > = ( {
	title,
	action,
	icon,
	className,
	children,
} ) => (
	<Card className={ clsx( 'stats-widget-section', className ) } size="small">
		<CardHeader className="stats-widget-section__header" size="xSmall" isBorderless>
			<div className="stats-widget-section__heading">
				{ icon && <Icon icon={ icon } size={ 24 } /> }
				<h3 className="stats-widget-section__title">{ title }</h3>
			</div>
			{ action }
		</CardHeader>
		<CardBody className="stats-widget-section__body" size="small">
			{ children }
		</CardBody>
	</Card>
);

export default WidgetSection;
