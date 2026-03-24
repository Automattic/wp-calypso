import { __experimentalHStack as HStack, __experimentalItem as Item } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import RouterLinkButton from '../../components/router-link-button';
import type { ActiveOptions } from '@tanstack/react-router';

import './sidebar-menu-item.scss';

interface SidebarMenuItemProps {
	to?: string;
	href?: string;
	target?: string;
	rel?: string;
	icon?: React.JSX.Element;
	children: React.ReactNode;
	activeOptions?: ActiveOptions;
}

export function SidebarMenuItem( {
	to,
	href,
	target,
	rel,
	icon,
	children,
	activeOptions,
}: SidebarMenuItemProps ) {
	const { recordTracksEvent } = useAnalytics();

	const handleClick = () => {
		recordTracksEvent( 'calypso_dashboard_menu_item_click', { to: to ?? href ?? '' } );
	};

	const content = icon ? (
		<HStack justify="flex-start" spacing={ 2 }>
			<Icon icon={ icon } size={ 20 } />
			<span>{ children }</span>
		</HStack>
	) : (
		children
	);

	if ( href ) {
		return (
			<Item
				as="a"
				className="dashboard-sidebar__menu-item"
				href={ href }
				target={ target }
				rel={ rel }
				onClick={ handleClick }
			>
				{ content }
			</Item>
		);
	}

	return (
		<RouterLinkButton
			className="dashboard-sidebar__menu-item"
			variant="tertiary"
			to={ to }
			activeOptions={ activeOptions }
			__next40pxDefaultSize
			onClick={ handleClick }
		>
			{ content }
		</RouterLinkButton>
	);
}
