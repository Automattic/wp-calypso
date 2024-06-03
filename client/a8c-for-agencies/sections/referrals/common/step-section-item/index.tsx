import { Button, Badge } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import React from 'react';
import StatusBadge from './status-badge';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

const ICON_SIZE = 24;

interface StepSectionItemProps {
	icon: JSX.Element;
	heading: string;
	description: TranslateResult;
	buttonProps?: React.ComponentProps< typeof Button >;
	statusProps?: React.ComponentProps< typeof Badge > & { tooltip?: string };
	className?: string;
	iconClassName?: string;
	isAutomatedReferral?: boolean;
}

export default function StepSectionItem( {
	icon,
	heading,
	description,
	buttonProps,
	statusProps,
	className,
	iconClassName,
	isAutomatedReferral = false,
}: StepSectionItemProps ) {
	const status = <StatusBadge statusProps={ statusProps } />;

	const buttonContent = buttonProps && (
		<div className="step-section-item__button">
			<Button { ...buttonProps } />
		</div>
	);

	const statusContent = statusProps && (
		<div className="step-section-item__status is-large-screen">{ status }</div>
	);

	return (
		<div className={ clsx( 'step-section-item', className ) }>
			<div className={ clsx( 'step-section-item__icon', iconClassName ) }>
				<Icon
					className="sidebar__menu-icon"
					style={ { fill: 'currentcolor' } }
					icon={ icon }
					size={ ICON_SIZE }
				/>
			</div>
			<div className="step-section-item__content">
				{ statusProps && (
					<div className="step-section-item__status is-small-screen">{ status }</div>
				) }
				<div className="step-section-item__heading">
					{ heading } { isAutomatedReferral && statusContent }
				</div>
				<div className="step-section-item__description">{ description }</div>
				{ ! isAutomatedReferral && buttonContent }
			</div>
			{ isAutomatedReferral ? buttonContent : statusContent }
		</div>
	);
}
