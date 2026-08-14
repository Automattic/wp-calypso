import { omnibarSiteIdQuery, queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AnalyticsProvider } from 'calypso/dashboard/app/analytics';
import { APP_CONTEXT_DEFAULT_CONFIG, AppProvider } from 'calypso/dashboard/app/context';
import { omnibarEvents, useOmnibarEvent } from 'calypso/dashboard/app/omnibar/events';
import OmnibarContainer from 'calypso/dashboard/app/omnibar/omnibar';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import { useDispatch, useSelector } from 'calypso/state';
import getUnseenCount from 'calypso/state/selectors/get-notification-unseen-count';
import getIsNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { toggleNotificationsPanel } from 'calypso/state/ui/actions';
import { activateNextLayoutFocus, setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { AnalyticsClient } from 'calypso/dashboard/app/analytics';
import type { AppConfig } from 'calypso/dashboard/app/context';

import 'calypso/dashboard/app/omnibar/style.scss';
import '@automattic/omnibar/style.scss';

const analyticsClient: AnalyticsClient = {
	recordTracksEvent,
	recordPageView: () => {},
};

function useOmnibarBridge() {
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const unseenCount = useSelector( getUnseenCount );
	const isNotificationsOpen = useSelector( getIsNotificationsOpen );
	const currentLayoutFocus = useSelector( getCurrentLayoutFocus );

	useEffect( () => {
		queryClient.cancelQueries( { queryKey: omnibarSiteIdQuery().queryKey } );
		queryClient.setQueryData( omnibarSiteIdQuery().queryKey, siteId ?? null );
	}, [ siteId ] );

	useEffect( () => {
		if ( unseenCount !== null ) {
			omnibarEvents.notificationsUnseenCount.emit( unseenCount );
		}
	}, [ unseenCount ] );

	useEffect( () => {
		omnibarEvents.notificationsOpen.emit( isNotificationsOpen );
	}, [ isNotificationsOpen ] );

	useOmnibarEvent( 'notifications', () => {
		dispatch( toggleNotificationsPanel() );
	} );

	useOmnibarEvent( 'mobileMenu', () => {
		recordTracksEvent( 'calypso_masterbar_menu_clicked' );
		dispatch( setNextLayoutFocus( currentLayoutFocus === 'sidebar' ? 'content' : 'sidebar' ) );
		dispatch( activateNextLayoutFocus() );
	} );
}

export default function Omnibar( { loadHelpCenterIcon }: { loadHelpCenterIcon?: boolean } ) {
	useOmnibarBridge();

	const config: AppConfig = {
		...APP_CONTEXT_DEFAULT_CONFIG,
		name: 'WordPress.com',
		supports: {
			...APP_CONTEXT_DEFAULT_CONFIG.supports,
			reader: true,
			notifications: true,
			help: !! loadHelpCenterIcon,
		},
	};

	return (
		<AppProvider config={ config }>
			<QueryClientProvider client={ queryClient }>
				<AnalyticsProvider client={ analyticsClient }>
					<div id="wpcom-omnibar">
						<OmnibarContainer user={ window.currentUser } cartManagerClient={ cartManagerClient } />
					</div>
				</AnalyticsProvider>
			</QueryClientProvider>
		</AppProvider>
	);
}
