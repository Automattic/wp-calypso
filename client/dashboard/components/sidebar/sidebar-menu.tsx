import { __experimentalVStack as VStack } from '@wordpress/components';

import './sidebar-menu.scss';

export function SidebarMenu( { children }: { children: React.ReactNode } ) {
	return (
		<VStack as="nav" className="dashboard-sidebar__menu" spacing={ 1 }>
			{ children }
		</VStack>
	);
}
