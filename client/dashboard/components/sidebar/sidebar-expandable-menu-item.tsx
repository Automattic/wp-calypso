import { useRouterState } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Icon, chevronDown, chevronUp } from '@wordpress/icons';
import { Children, cloneElement, isValidElement, useState, useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';
import RouterLinkButton from '../../components/router-link-button';
import { SidebarMenuItem } from './sidebar-menu-item';

import './sidebar-expandable-menu-item.scss';

const dotIcon = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
		<circle cx="12" cy="12" r="2" fill="#ccc" className="dashboard-sidebar__dot" />
	</svg>
);

interface SidebarExpandableMenuItemProps {
	label: string;
	icon?: React.JSX.Element;
	to: string;
	defaultTo: string;
	children: React.ReactNode;
}

export function SidebarExpandableMenuItem( {
	label,
	icon,
	to,
	defaultTo,
	children,
}: SidebarExpandableMenuItemProps ) {
	const { recordTracksEvent } = useAnalytics();
	const pathname = useRouterState( {
		select: ( state ) => state.location.pathname,
	} );
	const isActive = pathname.startsWith( to );
	const [ isOpen, setIsOpen ] = useState( isActive );

	// Sync open state with active state when navigating
	useEffect( () => {
		setIsOpen( isActive );
	}, [ isActive ] );

	return (
		<VStack className="dashboard-sidebar__expandable" spacing={ 1 }>
			<RouterLinkButton
				className="dashboard-sidebar__menu-item dashboard-sidebar__expandable-trigger"
				variant="tertiary"
				activeProps={ {
					className: 'dashboard-sidebar__menu-item dashboard-sidebar__expandable-trigger',
				} }
				to={ defaultTo }
				onClick={ ( e: React.MouseEvent ) => {
					if ( isActive ) {
						e.preventDefault();
						setIsOpen( ( prev ) => ! prev );
					} else {
						setIsOpen( true );
						recordTracksEvent( 'calypso_dashboard_menu_item_click', { to: defaultTo } );
					}
				} }
				__next40pxDefaultSize
			>
				<HStack justify="space-between">
					<HStack justify="flex-start" spacing={ 2 } expanded={ false }>
						{ icon && <Icon icon={ icon } size={ 20 } /> }
						<span>{ label }</span>
					</HStack>
					<Icon icon={ isOpen ? chevronUp : chevronDown } size={ 18 } />
				</HStack>
			</RouterLinkButton>
			{ isOpen && (
				<VStack className="dashboard-sidebar__expandable-children" spacing={ 1 }>
					{ Children.map( children, ( child ) => {
						if ( isValidElement( child ) && child.type === SidebarMenuItem && ! child.props.icon ) {
							return cloneElement( child, { icon: dotIcon } );
						}
						return child;
					} ) }
				</VStack>
			) }
		</VStack>
	);
}
