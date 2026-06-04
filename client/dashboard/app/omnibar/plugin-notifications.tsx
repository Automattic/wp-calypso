import { __ } from '@wordpress/i18n';
import { Icon, bell, bellUnread } from '@wordpress/icons';
import { useEffect, useRef, useState } from 'react';
import { omnibarEvents, useOmnibarEvent } from './events';
import type { User } from '@automattic/api-core';
import type { OmnibarNode } from '@automattic/omnibar';

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
		omnibarEvents.notificationsAnchor.emit( bellRef.current?.closest( 'button' ) ?? null );
	} );

	return {
		id: 'notifications',
		label: __( 'Notifications' ),
		icon: <Icon ref={ bellRef } icon={ hasUnseenNotifications ? bellUnread : bell } />,
		onClick: () => omnibarEvents.notifications.emit(),
	};
}
