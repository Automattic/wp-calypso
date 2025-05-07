import { __experimentalHStack as HStack } from '@wordpress/components';
import RouterLinkButton from '../router-link-button';
import type { ActiveOptions } from '@tanstack/react-router';
import './style.scss';

function MenuItem( {
	to,
	children,
	activeOptions,
}: {
	to: string;
	children: React.ReactNode;
	activeOptions?: ActiveOptions;
} ) {
	return (
		<RouterLinkButton
			className="dashboard-menu__item"
			variant="tertiary"
			to={ to }
			activeOptions={ activeOptions }
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
