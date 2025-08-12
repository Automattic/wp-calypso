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
	stepNumber,
	children,
}: StepSectionItemProps ) {
	const status = <StatusBadge statusProps={ statusProps } />;

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
					{ heading }
					{ statusProps && (
						<div className="step-section-item__status is-large-screen">{ status }</div>
					) }
				</div>
				<div className="step-section-item__description">{ preventWidows( description ) }</div>
			</div>
			{ buttonProps && (
				<div className="step-section-item__button">
					<Button { ...buttonProps } />
				</div>
			) }
			{ children }
		</div>
	);
}
