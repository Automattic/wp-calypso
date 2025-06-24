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
