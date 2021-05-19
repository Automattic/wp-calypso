/**
 * External dependencies
 */
import NotificationsPanel from '@automattic/notifications/src/panel/Notifications';
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import Main from 'calypso/components/main';

import './style.scss';

const Notifications = () => {
	const locale = useSelector( getCurrentUserLocale );

	return (
		<Main wideLayout className="notifications__main">
			<NotificationsPanel isShowing isVisible locale={ locale } wpcom={ wpcom } />
		</Main>
	);
};

export default Notifications;
