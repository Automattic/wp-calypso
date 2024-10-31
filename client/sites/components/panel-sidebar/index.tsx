import { Button } from '@wordpress/components';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import './style.scss';

export function SidebarItem( { href, children }: { href: string; children: ReactNode } ) {
	const isActive = window.location.pathname.startsWith( href );

	return (
		<Button
			href={ href }
			className={ clsx( 'panel-sidebar-tab', {
				'panel-sidebar-tab--active': isActive,
			} ) }
		>
			{ children }
		</Button>
	);
}

export function Sidebar( { children }: { children: ReactNode } ) {
	return <div className="panel-sidebar">{ children }</div>;
}

export function PanelWithSidebar( { children }: { children: ReactNode } ) {
	return <div className="panel-with-sidebar">{ children }</div>;
}
