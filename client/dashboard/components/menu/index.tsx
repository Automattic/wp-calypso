import { __experimentalHStack as HStack, MenuItem as WPMenuItem } from '@wordpress/components';
import { ComponentProps, ComponentType } from 'react';
import RouterLinkButton from '../router-link-button';
import type { ActiveOptions } from '@tanstack/react-router';
import './style.scss';

interface MenuItemLinkProps
	extends Omit< ComponentProps< typeof WPMenuItem >, 'href' | 'target' | 'rel' > {
	href?: string;
	target?: string;
	rel?: string;
}

const MenuItemLink = WPMenuItem as ComponentType< MenuItemLinkProps >;

function MenuItem( {
	to,
	children,
	activeOptions,
	onClick,
}: {
	to: string;
	children: React.ReactNode;
	activeOptions?: ActiveOptions;
	onClick?: () => void;
} ) {
	return (
		<RouterLinkButton
			className="dashboard-menu__item"
			variant="tertiary"
			to={ to }
			activeOptions={ activeOptions }
			__next40pxDefaultSize
			onClick={ onClick }
		>
			{ children }
		</RouterLinkButton>
	);
}

function Menu( { children }: { children: React.ReactNode } ) {
	return (
		<HStack className="dashboard-menu" spacing={ 0 } justify="flex-start">
			{ children }
		</HStack>
	);
}

Menu.Item = MenuItem;
Menu.ItemLink = MenuItemLink;

export default Menu;
