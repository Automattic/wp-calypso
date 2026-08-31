import { useRouterState } from '@tanstack/react-router';
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
	// A selected note is a path segment, so the unfiltered list reads as
	// /notifications/<noteId>. Matching that exactly would unhighlight All, and
	// matching it loosely would highlight All on every category, so the exact
	// match is dropped only while the note id is the sole segment.
	const pathname = useRouterState( { select: ( state ) => state.location.pathname } );
	const isNoteInAllList = /^\/notifications\/\d+$/.test( pathname );

	return (
		<SidebarMenu>
			<SidebarMenuItem
				icon={ archive }
				to="/notifications"
				activeOptions={ isNoteInAllList ? undefined : { exact: true } }
			>
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
