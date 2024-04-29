import { Button, Badge } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import React from 'react';
import StatusBadge from './status-badge';

import './style.scss';

const ICON_SIZE = 24;

interface StepSectionItemProps {
	icon: JSX.Element;
	heading: string;
	description: string;
	buttonProps?: React.ComponentProps< typeof Button >;
	statusProps?: React.ComponentProps< typeof Badge > & { tooltip?: string };
}

export default function StepSectionItem( {
	icon,
	heading,
	description,
	buttonProps,
	statusProps,
}: StepSectionItemProps ) {
	const status = <StatusBadge statusProps={ statusProps } />;

	return (
		<div className="step-section-item">
			<div className="step-section-item__icon">
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
				<div className="step-section-item__heading">{ heading }</div>
				<div className="step-section-item__description">{ description }</div>
				{ buttonProps && (
					<div className="step-section-item__button">
						<Button { ...buttonProps } />
					</div>
				) }
			</div>
			{ statusProps && <div className="step-section-item__status is-large-screen">{ status }</div> }
		</div>
	);
}
