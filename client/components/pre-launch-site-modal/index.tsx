import { DomainSubtype } from '@automattic/api-core';
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
	const siteResult = useQuery( { ...siteByIdQuery( siteId ), enabled: !! siteId } );
	const site = siteResult.data;
	const domainsResult = useQuery( {
		...domainsQuery(),
		enabled: !! siteId,
		select: ( data ) => data.filter( ( domain ) => domain.blog_id === siteId ),
	} );

	// On either error we fall back to the flow rather than leaving the caller
	// stuck with the modal neither open nor redirecting.
	const isSettled =
		( siteResult.isSuccess || siteResult.isError ) &&
		( domainsResult.isSuccess || domainsResult.isError );
	// Mirror the launch flow's domain-skip rule so the modal's "custom domain"
	// set matches the set of sites for which `/start/launch-site` skips its
	// domain step. That flow's `isDomainFulfilled` skips the step when the site
	// has any non-WPCOM domain (`! isWPCOMDomain`) — i.e. anything other than the
	// default `*.wordpress.com` address. Gating on the same signal guarantees
	// that confirming "launch" never drops the user onto a domain step.
	const customDomains = ( domainsResult.data ?? [] ).filter(
		( domain ) => domain.subtype.id !== DomainSubtype.DEFAULT_ADDRESS
	);
	const hasCustomDomain = customDomains.length > 0;
	const qualifiesForPreLaunch =
		!! site &&
		siteResult.isSuccess &&
		domainsResult.isSuccess &&
		isSitePlanPaid( site ) &&
		hasCustomDomain;

	// Decide once and freeze it: after the modal is shown, a later refetch error
	// must not re-decide and redirect a qualifying site into an unconfirmed launch.
	const [ decision, setDecision ] = useState< 'pending' | 'modal' | 'redirect' >( 'pending' );

	useEffect( () => {
		if ( decision !== 'pending' || ! isOpen || ! isSettled ) {
			return;
		}
		setDecision( qualifiesForPreLaunch ? 'modal' : 'redirect' );
	}, [ decision, isOpen, isSettled, qualifiesForPreLaunch ] );

	useEffect( () => {
		if ( decision === 'redirect' && launchUrl ) {
			window.location.assign( launchUrl );
		}
	}, [ decision, launchUrl ] );

	if ( decision !== 'modal' || ! isOpen || ! site ) {
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
