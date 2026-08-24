import { queryClient, siteByIdQuery, domainsQuery } from '@automattic/api-queries';
import { PreLaunchModal } from '@automattic/site-launch-modals';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useResizeObserver } from '@wordpress/compose';
import { useEffect, useState } from 'react';
import { isSitePlanPaid } from 'calypso/dashboard/sites/plans';
import SitePreview from 'calypso/dashboard/sites/site-preview';
import { getSitePlanDisplayName } from 'calypso/dashboard/utils/site-plan';

import './style.scss';

const PREVIEW_BASE_WIDTH = 1200;

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
 * pre-launch modal.
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
	const [ previewResizeListener, { width: previewWidth, height: previewHeight } ] =
		useResizeObserver();
	const [ isPreviewLoaded, setIsPreviewLoaded ] = useState( false );

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
	const customDomains = ( domainsResult.data ?? [] ).filter(
		( domain ) => domain.subscription_id !== null
	);
	const hasCustomDomain = customDomains.length > 0;
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

	const siteDomain = hasCustomDomain ? customDomains[ 0 ].domain : site.slug;
	const planName = site.plan?.product_name ?? getSitePlanDisplayName( site );

	return (
		<PreLaunchModal
			siteName={ site.name }
			siteDomain={ siteDomain }
			planName={ planName }
			isLaunching={ isRedirecting }
			onClose={ onClose }
			onLaunch={ () => {
				setIsRedirecting( true );
				window.location.assign( launchUrl );
			} }
			preview={
				site.URL ? (
					<div
						className="site-launch-pre-launch-modal__thumbnail"
						data-preview-loaded={ isPreviewLoaded }
					>
						{ previewResizeListener }
						{ !! previewWidth && !! previewHeight && (
							<SitePreview
								url={ site.URL }
								scale={ previewWidth / PREVIEW_BASE_WIDTH }
								height={ previewHeight / ( previewWidth / PREVIEW_BASE_WIDTH ) }
								onLoad={ () => setIsPreviewLoaded( true ) }
							/>
						) }
					</div>
				) : null
			}
		/>
	);
}

export default function PreLaunchSiteModal( props: PreLaunchSiteModalProps ) {
	if ( ! props.siteId ) {
		return null;
	}

	// Mounted (and prefetching) whenever a site is present, even while closed, so
	// the modal can open instantly. It renders nothing until `isOpen`.
	return (
		<QueryClientProvider client={ queryClient }>
			<PreLaunchSiteModalContent { ...props } />
		</QueryClientProvider>
	);
}
