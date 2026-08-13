import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import { wpcomLink } from '../../utils/link';
import { omnibarEvents, useOmnibarEvent } from './events';
import type { User } from '@automattic/api-core';
import type { OmnibarNode } from '@automattic/omnibar';

import './plugin-notifications.scss';

function BellIcon( { hasUnread }: { hasUnread: boolean } ) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<path d="M9.9,20h4c0,0.5-0.2,1-0.6,1.4c-0.8,0.8-2,0.8-2.8,0C10.1,21,9.9,20.5,9.9,20z M20,17.5v1H4v-1l0.9-0.7C5.5,16.3,6,15.5,6,15l0-5.5c0-3.3,2.7-6,6-6c3.3,0,6,2.7,6,6V15c0,0.5,0.5,1.4,1.1,1.8L20,17.5z" />
			{ hasUnread && (
				<circle className="omnibar__notifications-unread-dot" cx="19.5" cy="4.5" r="3.7" />
			) }
		</svg>
	);
}

export function useNotificationsPlugin( { user }: { user?: User } ): OmnibarNode {
	const [ hasUnseenNotifications, setHasUnseenNotifications ] = useState(
		!! user?.has_unseen_notes
	);

	useOmnibarEvent( 'notificationsUnseenCount', ( count ) =>
		setHasUnseenNotifications( count > 0 )
	);

	const bellRef = useRef< HTMLSpanElement >( null );

	// Re-runs every commit so the anchor stays correct if the bell button is replaced.
	useEffect( () => {
		omnibarEvents.notificationsAnchor.emit( bellRef.current?.closest( 'a' ) ?? null );
	} );

	return {
		id: 'notifications',
		label: __( 'Notifications' ),
		icon: (
			<span ref={ bellRef } className="omnibar__notifications-icon">
				<BellIcon hasUnread={ hasUnseenNotifications } />
			</span>
		),
		href: wpcomLink( '/notifications' ),
		onClick: ( event ) => {
			event.preventDefault();
			omnibarEvents.notifications.emit();
		},
	};
}
