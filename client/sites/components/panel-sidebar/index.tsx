import { SelectDropdown } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import clsx from 'clsx';
import { Children, isValidElement } from 'react';
import { navigate } from 'calypso/lib/navigate';
import type { ReactNode, ReactElement } from 'react';

import './style.scss';

export function SidebarItem( {
	enabled = true,
	href,
	children,
}: {
	enabled?: boolean;
	href: string;
	children: ReactNode;
} ) {
	const isActive = window.location.pathname.startsWith( href );

	if ( ! enabled && ! isActive ) {
		return null;
	}

	return (
		<li>
			<Button
				href={ href }
				className={ clsx( 'panel-sidebar-tab', {
					'panel-sidebar-tab--active': isActive,
				} ) }
			>
				{ children }
			</Button>
		</li>
	);
}

export function Sidebar( { children }: { children: ReactNode } ) {
	const isDesktop = useViewportMatch( 'small', '>=' );
	const activeElement = Children.toArray( children ).find(
		( child ) => isValidElement( child ) && window.location.pathname.startsWith( child.props.href )
	) as ReactElement;

	if ( isDesktop ) {
		return <ul className="panel-sidebar">{ children }</ul>;
	}

	return (
		<SelectDropdown
			className="panel-sidebar panel-sidebar-dropdown"
			selectedText={ activeElement?.props?.children }
		>
			{ Children.toArray( children )
				.filter( ( child ) => child && isValidElement( child ) )
				.map( ( child, index ) => {
					const { href, ...childProps } = ( child as ReactElement ).props;
					return (
						<SelectDropdown.Item
							{ ...childProps }
							key={ index }
							selected={ window.location.pathname.startsWith( href ) }
							onClick={ () => navigate( href ) }
						/>
					);
				} ) }
		</SelectDropdown>
	);
}

export function PanelWithSidebar( { children }: { children: ReactNode } ) {
	return <div className="panel-with-sidebar">{ children }</div>;
}
