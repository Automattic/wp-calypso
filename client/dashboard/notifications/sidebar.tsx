import { useRouterState } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Notice,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { archive, comment, people, starEmpty, unseen } from '@wordpress/icons';
import { SidebarBackButton, SidebarMenu, SidebarMenuItem } from '../components/sidebar';
import { NotesProvider, useUnreadCount } from './engine';
import {
	InboxVariantPicker,
	ListVariantPicker,
	useInboxVariantState,
	useListVariantState,
} from './variants';

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

function ExperimentControls() {
	const [ variant, setVariantKey ] = useInboxVariantState();
	const [ listVariant, setListVariantKey ] = useListVariantState();
	return (
		<div className="dashboard-notifications-inbox__experiment-controls">
			<Notice status="warning" isDismissible={ false }>
				<VStack spacing={ 3 }>
					<Text>{ __( 'Internal experiment — layouts will change.' ) }</Text>
					<ListVariantPicker value={ listVariant.key } onChange={ setListVariantKey } />
					<InboxVariantPicker value={ variant.key } onChange={ setVariantKey } />
				</VStack>
			</Notice>
		</div>
	);
}

export default function NotificationsSidebar() {
	return (
		<NotesProvider>
			<SidebarBackButton to="/">{ __( 'Notifications' ) }</SidebarBackButton>
			<NotificationsSidebarMenu />
			<ExperimentControls />
		</NotesProvider>
	);
}
