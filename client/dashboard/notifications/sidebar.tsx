import { __ } from '@wordpress/i18n';
import { archive, comment, people, starEmpty, unseen } from '@wordpress/icons';
import { SidebarBackButton, SidebarMenu, SidebarMenuItem } from '../components/sidebar';
import { NotesProvider, useUnreadCount } from './engine';

function UnreadCount() {
	const count = useUnreadCount();

	if ( count === 0 ) {
		return null;
	}

	return <span className="dashboard-notifications-inbox__unread-count">{ count }</span>;
}

function NotificationsSidebarMenu() {
	return (
		<SidebarMenu>
			<SidebarMenuItem icon={ archive } to="/notifications" activeOptions={ { exact: true } }>
				{ __( 'All' ) }
			</SidebarMenuItem>
			<SidebarMenuItem icon={ unseen } to="/notifications/unread">
				{ __( 'Unread' ) }
				<UnreadCount />
			</SidebarMenuItem>
			<SidebarMenuItem icon={ comment } to="/notifications/comments">
				{ __( 'Comments' ) }
			</SidebarMenuItem>
			<SidebarMenuItem icon={ people } to="/notifications/subscribers">
				{ __( 'Subscribers' ) }
			</SidebarMenuItem>
			<SidebarMenuItem icon={ starEmpty } to="/notifications/likes">
				{ __( 'Likes' ) }
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

export default function NotificationsSidebar() {
	return (
		<NotesProvider>
			<SidebarBackButton to="/">{ __( 'Notifications' ) }</SidebarBackButton>
			<NotificationsSidebarMenu />
		</NotesProvider>
	);
}
