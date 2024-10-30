import { Button } from '@wordpress/components';
import clsx from 'clsx';
import React from 'react';
import type { ReactNode } from 'react';
import './style.scss';

interface SidebarItemProps {
	href: string;
	itemKey: string;
	selectedItemKey?: string;
	children: ReactNode;
}

export function SidebarItem( { href, itemKey, selectedItemKey, children }: SidebarItemProps ) {
	return (
		<li>
			<Button
				href={ href }
				className={ clsx( 'panel-sidebar-tab', {
					'panel-sidebar-tab--active': selectedItemKey === itemKey,
				} ) }
			>
				{ children }
			</Button>
		</li>
	);
}

interface SidebarProps {
	children: ReactNode;
	selectedItemKey: string;
}

export function Sidebar( { children, selectedItemKey }: SidebarProps ) {
	return (
		<div className="panel-sidebar">
			<ul>
				{ React.Children.map( children, ( child ) =>
					React.cloneElement( child as React.ReactElement, { selectedItemKey } )
				) }
			</ul>
		</div>
	);
}

export function PanelWithSidebar( { children }: { children: ReactNode } ) {
	return <div className="panel-with-sidebar">{ children }</div>;
}
