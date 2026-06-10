import { Icon, plus } from '@wordpress/icons';
import clsx from 'clsx';

interface MenuItemProps extends React.HTMLAttributes< HTMLLIElement > {
	selected: boolean;
	children: React.ReactNode;
	className?: string;
}

export const MenuItem = ( { selected, children, className, ...props }: MenuItemProps ) => {
	return (
		<li
			{ ...props }
			className={ clsx( 'sidebar__menu-item', className, {
				'sidebar__menu-item--selected selected': selected,
			} ) }
		>
			{ children }
		</li>
	);
};

interface MenuItemLinkProps extends React.AnchorHTMLAttributes< HTMLAnchorElement > {
	children: React.ReactNode;
}

export const MenuItemLink = ( { children, className, ...props }: MenuItemLinkProps ) => {
	return (
		<a { ...props } className={ clsx( 'sidebar__menu-link', className ) }>
			{ children }
		</a>
	);
};

interface MenuListProps extends React.HTMLAttributes< HTMLUListElement > {
	children: React.ReactNode;
	className?: string;
}

export const MenuList = ( { children, className, ...props }: MenuListProps ) => {
	return (
		<ul { ...props } className={ clsx( 'sidebar__menu-list', className ) }>
			{ children }
		</ul>
	);
};

interface AddMenuItemProps {
	label: string;
	href: string;
	icon?: React.ComponentProps< typeof Icon >[ 'icon' ];
	onClick?: () => void;
}

/**
 * A "+ Add …" footer row for a sidebar menu section. Renders a non-selected
 * menu item with a leading icon (a plus by default) and a label.
 */
export const AddMenuItem = ( { label, href, icon = plus, onClick }: AddMenuItemProps ) => {
	return (
		<MenuItem selected={ false } className="sidebar__menu-add-item">
			<MenuItemLink className="sidebar__menu-link" href={ href } onClick={ onClick }>
				<Icon icon={ icon } size={ 22 } />
				<div className="sidebar__menu-item-title">{ label }</div>
			</MenuItemLink>
		</MenuItem>
	);
};
