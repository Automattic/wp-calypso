import { __experimentalHStack as HStack } from '@wordpress/components';

import './sidebar-menu-switcher-item.scss';

interface SidebarMenuSwitcherItemProps {
	switcher: React.ReactNode;
	children: React.ReactNode;
}

export function SidebarMenuSwitcherItem( { switcher, children }: SidebarMenuSwitcherItemProps ) {
	return (
		<HStack className="sidebar-menu-switcher-item" spacing={ 0 } expanded={ false }>
			{ children }
			<div className="sidebar-menu-switcher-item__switcher">{ switcher }</div>
		</HStack>
	);
}
