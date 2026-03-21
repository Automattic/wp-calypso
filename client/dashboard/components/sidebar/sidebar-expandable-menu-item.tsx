import { useRouterState } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { Icon, chevronDown, chevronUp } from '@wordpress/icons';
import { useState, useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';
import RouterLinkButton from '../../components/router-link-button';

import './sidebar-expandable-menu-item.scss';

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
		<div className="dashboard-sidebar__expandable">
			<RouterLinkButton
				className="dashboard-sidebar__menu-item dashboard-sidebar__expandable-trigger"
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
			{ isOpen && <div className="dashboard-sidebar__expandable-children">{ children }</div> }
		</div>
	);
}
