import {
	__experimentalHStack as HStack,
	Button,
	MenuItem as WPMenuItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
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

type MenuExternalItemComponent = typeof Button | typeof MenuItemLink;
type MenuExternalItemProps = {
	as?: MenuExternalItemComponent;
	className?: string;
	href: string;
	children: React.ReactNode;
	onClick?: () => void;
};

function MenuExternalItem( { as, className, href, children, onClick }: MenuExternalItemProps ) {
	const Component = as ?? Button;

	return (
		<Component
			__next40pxDefaultSize
			className={ className }
			href={ href }
			target="_blank"
			rel="noopener noreferrer"
			onClick={ onClick }
		>
			<HStack justify="flex-start">
				<span>{ children }</span>
				<span aria-label={ __( '(opens in a new tab)' ) }>&#8599;</span>
			</HStack>
		</Component>
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
Menu.ExternalItem = MenuExternalItem;

export default Menu;
