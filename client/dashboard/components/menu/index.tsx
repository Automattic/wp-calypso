import { __experimentalHStack as HStack, MenuItem as WPMenuItem } from '@wordpress/components';
import { ComponentProps, ComponentType } from 'react';
import RouterLinkButton from '../router-link-button';
import './style.scss';

interface MenuItemLinkProps
	extends Omit< ComponentProps< typeof WPMenuItem >, 'href' | 'target' | 'rel' > {
	href?: string;
	target?: string;
	rel?: string;
}

const MenuItemLink = WPMenuItem as ComponentType< MenuItemLinkProps >;

type MenuItemProps = Pick<
	ComponentProps< typeof RouterLinkButton >,
	'to' | 'activeOptions' | 'onClick'
> & { children: React.ReactNode };

function MenuItem( { to, children, activeOptions, onClick }: MenuItemProps ) {
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
