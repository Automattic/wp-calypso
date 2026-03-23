import { useRouterState } from '@tanstack/react-router';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Icon, chevronDown, chevronUp } from '@wordpress/icons';
import { Children, cloneElement, isValidElement, useId, useState, useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';
import { SidebarMenuItem } from './sidebar-menu-item';

import './sidebar-expandable-menu-item.scss';

const dotIcon = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
		<circle cx="12" cy="12" r="2" fill="currentColor" />
	</svg>
);

interface SidebarExpandableMenuItemProps {
	label: string;
	icon?: React.JSX.Element;
	to: string;
	children: React.ReactNode;
}

export function SidebarExpandableMenuItem( {
	label,
	icon,
	to,
	children,
}: SidebarExpandableMenuItemProps ) {
	const { recordTracksEvent } = useAnalytics();
	const pathname = useRouterState( {
		select: ( state ) => state.location.pathname,
	} );
	const isActive = pathname.startsWith( to );
	const [ isOpen, setIsOpen ] = useState( isActive );
	const panelId = useId();

	// Sync open state with active state when navigating
	useEffect( () => {
		setIsOpen( isActive );
	}, [ isActive ] );

	return (
		<VStack className="dashboard-sidebar__expandable" spacing={ 1 }>
			<Button
				className="dashboard-sidebar__menu-item"
				variant="tertiary"
				onClick={ () => {
					setIsOpen( ( prev ) => ! prev );
					recordTracksEvent( 'calypso_dashboard_menu_item_click', { to } );
				} }
				aria-expanded={ isOpen }
				aria-controls={ panelId }
				__next40pxDefaultSize
			>
				<HStack justify="space-between">
					<HStack justify="flex-start" spacing={ 2 } expanded={ false }>
						{ icon && <Icon icon={ icon } size={ 20 } /> }
						<span>{ label }</span>
					</HStack>
					<Icon icon={ isOpen ? chevronUp : chevronDown } size={ 18 } />
				</HStack>
			</Button>
			{ isOpen && (
				<VStack id={ panelId } spacing={ 1 }>
					{ Children.map( children, ( child ) => {
						if ( isValidElement( child ) && child.type === SidebarMenuItem && ! child.props.icon ) {
							return cloneElement( child as React.ReactElement, { icon: dotIcon } );
						}
						return child;
					} ) }
				</VStack>
			) }
		</VStack>
	);
}
