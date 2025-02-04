export * from './header';
export * from './main';
export * from './footer';
export * from './navigator';
export * from './navigator/navigator-menu';
export * from './navigator/navigator-menu-item';

import clsx from 'clsx';

import './style.scss';

type Props = {
	className?: string;
	children: React.ReactNode;
};

const SidebarV2 = ( { children, className = '' }: Props ) => {
	return <nav className={ clsx( 'sidebar-v2', className ) }>{ children }</nav>;
};

export default SidebarV2;
