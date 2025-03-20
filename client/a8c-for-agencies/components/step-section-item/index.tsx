import { Button, Badge } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import React from 'react';
import { preventWidows } from 'calypso/lib/formatting';
import StatusBadge from './status-badge';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

const ICON_SIZE = 24;

interface StepSectionItemProps {
	icon?: JSX.Element;
	heading: string;
	description: TranslateResult;
	buttonProps?: React.ComponentProps< typeof Button >;
	statusProps?: React.ComponentProps< typeof Badge > & { tooltip?: string };
	className?: string;
	iconClassName?: string;
	isNewLayout?: boolean;
	stepNumber?: number;
	children?: React.ReactNode;
}

export default function StepSectionItem( {
	icon,
	heading,
	description,
	buttonProps,
	statusProps,
	className,
	iconClassName,
	isNewLayout = false,
	stepNumber,
	children,
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
			{ icon && (
				<div className={ clsx( 'step-section-item__icon', iconClassName ) }>
					<Icon className="sidebar__menu-icon" icon={ icon } size={ ICON_SIZE } />
				</div>
			) }
			{ stepNumber && <span className="step-section-item__step-number">{ stepNumber }</span> }
			<div className="step-section-item__content">
				{ statusProps && (
					<div className="step-section-item__status is-small-screen">{ status }</div>
				) }
				<div className="step-section-item__heading">
					{ heading } { isNewLayout && statusContent }
				</div>
				<div className="step-section-item__description">{ preventWidows( description ) }</div>
				{ ! isNewLayout && buttonContent }
			</div>
			{ isNewLayout ? buttonContent : statusContent }
			{ children }
		</div>
	);
}
