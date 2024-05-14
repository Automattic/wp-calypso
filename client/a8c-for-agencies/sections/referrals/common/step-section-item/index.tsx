import { Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import classNames from 'classnames';
import React from 'react';
import TipaltiStatusBadge from 'calypso/a8c-for-agencies/components/tipalti-status-badge';

import './style.scss';

const ICON_SIZE = 24;

interface StepSectionItemProps {
	icon: JSX.Element;
	heading: string;
	description: string | JSX.Element;
	buttonProps?: React.ComponentProps< typeof Button >;
	showStatusBadge?: boolean;
	className?: string;
}

export default function StepSectionItem( {
	icon,
	heading,
	description,
	buttonProps,
	showStatusBadge,
	className,
}: StepSectionItemProps ) {
	return (
		<div className={ classNames( 'step-section-item', className ) }>
			<div className="step-section-item__icon">
				<Icon
					className="sidebar__menu-icon"
					style={ { fill: 'currentcolor' } }
					icon={ icon }
					size={ ICON_SIZE }
				/>
			</div>
			<div className="step-section-item__content">
				{ showStatusBadge && (
					<div className="step-section-item__status is-small-screen">
						<TipaltiStatusBadge />
					</div>
				) }
				<div className="step-section-item__heading">{ heading }</div>
				<div className="step-section-item__description">{ description }</div>
				{ buttonProps && (
					<div className="step-section-item__button">
						<Button { ...buttonProps } />
					</div>
				) }
			</div>
			{ showStatusBadge && (
				<div className="step-section-item__status is-large-screen">
					<TipaltiStatusBadge />
				</div>
			) }
		</div>
	);
}
