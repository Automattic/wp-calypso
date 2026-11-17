import clsx from 'clsx';
import { forwardRef } from 'react';

interface MenuItemProps extends React.HTMLAttributes< HTMLLIElement > {
	selected: boolean;
	children: React.ReactNode;
	className?: string;
}

// forwardRef so consumers can reach the rendered `li` (e.g. to scroll the
// current item into view). Needed on React 18; React 19 passes `ref` as a prop.
export const MenuItem = forwardRef< HTMLLIElement, MenuItemProps >(
	( { selected, children, className, ...props }, ref ) => {
		return (
			<li
				{ ...props }
				ref={ ref }
				className={ clsx( 'sidebar__menu-item', className, {
					'sidebar__menu-item--selected selected': selected,
				} ) }
			>
				{ children }
			</li>
		);
	}
);
MenuItem.displayName = 'MenuItem';

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
