import { useMatchRoute } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import clsx from 'clsx';
import RouterLinkButton from '../router-link-button';

import './style.scss';

function MenuItem( { to, children }: { to: string; children: React.ReactNode } ) {
	const matchRoute = useMatchRoute();
	return (
		<RouterLinkButton
			className={ clsx( 'dashboard-menu__item', {
				'is-active': matchRoute( { to } ),
			} ) }
			variant="tertiary"
			to={ to }
			__next40pxDefaultSize
		>
			{ children }
		</RouterLinkButton>
	);
}

function Menu( { children }: { children: React.ReactNode } ) {
	return (
		<HStack className="dashboard-menu" spacing={ 2 } justify="flex-start">
			{ children }
		</HStack>
	);
}

Menu.Item = MenuItem;

export default Menu;
