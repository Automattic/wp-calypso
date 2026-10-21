import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import RouterLinkButton from '../../components/router-link-button';
import type { ActiveOptions } from '@tanstack/react-router';

import './sidebar-menu-item.scss';

interface SidebarMenuItemProps {
	to?: string;
	href?: string;
	icon?: React.JSX.Element;
	children: React.ReactNode;
	activeOptions?: ActiveOptions;
}

export function SidebarMenuItem( {
	to,
	href,
	icon,
	children,
	activeOptions,
}: SidebarMenuItemProps ) {
	const { recordTracksEvent } = useAnalytics();

	const handleClick = () => {
		recordTracksEvent( 'calypso_dashboard_menu_item_click', { to: to ?? href ?? '' } );
	};

	const label = href ? (
		<HStack justify="flex-start" spacing={ 1 }>
			<span>{ children }</span>
			<span aria-label={ __( '(opens in a new tab)' ) }>&#8599;</span>
		</HStack>
	) : (
		<span>{ children }</span>
	);

	const content = icon ? (
		<HStack justify="flex-start" spacing={ 2 }>
			<Icon icon={ icon } size={ 20 } />
			{ label }
		</HStack>
	) : (
		label
	);

	if ( href ) {
		return (
			<Button
				className="dashboard-sidebar__menu-item"
				variant="tertiary"
				href={ href }
				target="_blank"
				rel="noopener noreferrer"
				__next40pxDefaultSize
				onClick={ handleClick }
			>
				{ content }
			</Button>
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
