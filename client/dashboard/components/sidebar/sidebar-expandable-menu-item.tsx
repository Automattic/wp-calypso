import { useRouterState } from '@tanstack/react-router';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Icon, chevronDown, chevronUp } from '@wordpress/icons';
import clsx from 'clsx';
import { useId, useState, useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';

import './sidebar-expandable-menu-item.scss';

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
					const nextOpen = ! isOpen;
					setIsOpen( nextOpen );
					recordTracksEvent( 'calypso_dashboard_menu_item_toggled', {
						item: to,
						expanded: nextOpen,
					} );
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
			{ /* Wrapper div is needed because VStack's flex layout interferes with the CSS height animation. */ }
			<div
				className={ clsx( 'dashboard-sidebar__expandable-panel', {
					'is-open': isOpen,
				} ) }
				// @ts-expect-error For some reason there's no inert type.
				inert={ ! isOpen ? 'true' : undefined }
			>
				<VStack id={ panelId } spacing={ 1 }>
					{ children }
				</VStack>
			</div>
		</VStack>
	);
}
