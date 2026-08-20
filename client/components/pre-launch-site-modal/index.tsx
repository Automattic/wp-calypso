import { queryClient, siteByIdQuery, domainsQuery } from '@automattic/api-queries';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { AnalyticsProvider } from 'calypso/dashboard/app/analytics';
import { isSitePlanPaid } from 'calypso/dashboard/sites/plans';
import SiteLaunchModal from 'calypso/dashboard/sites/site-launch-modal';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

import './style.scss';

interface PreLaunchSiteModalProps {
	siteId: number;
	isOpen: boolean;
	onClose: () => void;
	// Where launch is handed off to. The caller owns this so the destination
	// (and the `/start/launch-site` path) stays explicit at each call site.
	launchUrl: string;
}

/**
 * Shared bridge that gates the classic "launch site" surfaces behind the
 * dashboard pre-launch modal.
 *
 * When a site already has a paid plan and a custom domain, the launch flow
 * auto-skips its domain and plan steps and launches immediately. For those sites
 * we show a confirmation modal first; on confirm we redirect to `launchUrl`.
 * Every other site is sent straight to `launchUrl`, preserving today's behavior.
 */
function PreLaunchSiteModalContent( {
	siteId,
	isOpen,
	onClose,
	launchUrl,
}: PreLaunchSiteModalProps ) {
	const [ isRedirecting, setIsRedirecting ] = useState( false );

	// Fetch as soon as there is a site (not only once open) so the qualification
	// decision is already settled by the time the user clicks — otherwise the
	// button appears unresponsive while these requests resolve.
	const { data: site } = useQuery( { ...siteByIdQuery( siteId ), enabled: !! siteId } );
	const domainsResult = useQuery( {
		...domainsQuery(),
		enabled: !! siteId,
		select: ( data ) => data.filter( ( domain ) => domain.blog_id === siteId ),
	} );

	// Wait until the site is loaded and the domains query has settled (success or
	// error) before deciding. On a domains error we fall back to the flow so the
	// launch action is never silently swallowed.
	const isReady = isOpen && !! site && ( domainsResult.isSuccess || domainsResult.isError );
	const hasCustomDomain = ( domainsResult.data ?? [] ).some(
		( domain ) => domain.subscription_id !== null
	);
	const qualifiesForPreLaunch =
		!! site && domainsResult.isSuccess && isSitePlanPaid( site ) && hasCustomDomain;

	useEffect( () => {
		if ( isReady && ! qualifiesForPreLaunch && launchUrl ) {
			window.location.assign( launchUrl );
		}
	}, [ isReady, qualifiesForPreLaunch, launchUrl ] );

	if ( ! isReady || ! qualifiesForPreLaunch || ! site ) {
		return null;
	}

	return (
		<SiteLaunchModal
			variant="pre-launch"
			isOpen
			site={ site }
			isLaunching={ isRedirecting }
			onClose={ onClose }
			onLaunch={ () => {
				setIsRedirecting( true );
				window.location.assign( launchUrl );
			} }
		/>
	);
}

export default function PreLaunchSiteModal( props: PreLaunchSiteModalProps ) {
	const analyticsClient = useMemo(
		() => ( {
			recordTracksEvent,
			recordPageView() {},
		} ),
		[]
	);

	if ( ! props.siteId ) {
		return null;
	}

	// Mounted (and prefetching) whenever a site is present, even while closed, so
	// the modal can open instantly. It renders nothing until `isOpen`.
	return (
		<QueryClientProvider client={ queryClient }>
			<AnalyticsProvider client={ analyticsClient }>
				<PreLaunchSiteModalContent { ...props } />
			</AnalyticsProvider>
		</QueryClientProvider>
	);
}
