import { useMatchRoute } from '@tanstack/react-router';
import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import clsx from 'clsx';
import './style.scss';

function MenuItem( { to, children }: { to: string; children: React.ReactNode } ) {
	const matchRoute = useMatchRoute();
	return (
		<Button
			className={ clsx( 'dashboard-menu__item', {
				'is-active': matchRoute( { to } ),
			} ) }
			variant="tertiary"
			href={ '.' + to }
			__next40pxDefaultSize
		>
			{ children }
		</Button>
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
