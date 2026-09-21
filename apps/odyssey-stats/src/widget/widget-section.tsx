import { Card, CardBody, CardHeader } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { ComponentProps, FunctionComponent, ReactNode } from 'react';

import './widget-section.scss';

interface WidgetSectionProps {
	/** Names the section. Rendered as the heading beneath the widget's own postbox title. */
	title: string;
	/** Optional control shown opposite the title, such as the date range select. */
	action?: ReactNode;
	/** Optional icon shown before the title. */
	icon?: ComponentProps< typeof Icon >[ 'icon' ];
	className?: string;
	children: ReactNode;
}

/**
 * The frame every section of the widget shares: card chrome, a title, and an optional
 * control opposite it.
 *
 * Built on `Card` rather than bespoke markup because `@wordpress/components` is
 * externalized here — the primitives come from wp-admin's own copy, so they cost no
 * bundle weight and age with WordPress instead of drifting from it.
 *
 * Deliberately has no `footer` slot. Two of the three sections end in a link, but they
 * are not the same thing: Site protection's belongs to the section, while Highlights'
 * "See more" changes with the selected tab and so belongs to the tab's content. A shared
 * slot would fit one and quietly mislead on the other, so trailing content stays with
 * the children.
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
