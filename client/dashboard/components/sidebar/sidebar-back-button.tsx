import { arrowLeft } from '@wordpress/icons';
import RouterLinkButton from '../../components/router-link-button';
import { SidebarMenu } from './sidebar-menu';

import './sidebar-back-button.scss';

export function SidebarBackButton( { to, children }: { to: string; children: React.ReactNode } ) {
	return (
		<SidebarMenu>
			<RouterLinkButton
				className="dashboard-sidebar__back-button"
				icon={ arrowLeft }
				iconSize={ 18 }
				to={ to }
			>
				{ children }
			</RouterLinkButton>
		</SidebarMenu>
	);
}
