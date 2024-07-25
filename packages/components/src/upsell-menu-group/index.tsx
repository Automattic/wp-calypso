import React from 'react';
import Gridicon from '../gridicon';
import './style.scss';

export function UpsellIcon() {
	return (
		<div className="upsell-menu-group__upsell-icon">
			{ /* eslint-disable-next-line wpcalypso/jsx-gridicon-size */ }
			<Gridicon className="upsell-menu-group__star-icon" icon="star" size={ 10 } />
		</div>
	);
}

interface UpsellCardProps {
	children: React.ReactNode;
	className?: string;
	icon?: React.ReactNode;
}
export function UpsellMenuGroup( props: UpsellCardProps ) {
	const { icon = <UpsellIcon />, children, ...rest } = props;
	return (
		<div className="upsell-menu-group__row" { ...rest }>
			{ icon }
			<div className="upsell-menu-group__content">{ children }</div>
		</div>
	);
}
