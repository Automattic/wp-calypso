import { arrowLeft } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import RouterLinkButton from '../../components/router-link-button';
import { SidebarMenu } from './sidebar-menu';

import './sidebar-back-button.scss';

export function SidebarBackButton( { to, children }: { to: string; children: React.ReactNode } ) {
	const { recordTracksEvent } = useAnalytics();

	const handleClick = () => {
		recordTracksEvent( 'calypso_dashboard_sidebar_back_button_click', { to } );
	};

	return (
		<SidebarMenu>
			<RouterLinkButton
				className="dashboard-sidebar__back-button"
				icon={ arrowLeft }
				iconSize={ 18 }
				to={ to }
				onClick={ handleClick }
			>
				{ children }
			</RouterLinkButton>
		</SidebarMenu>
	);
}
