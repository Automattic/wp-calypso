import { siteBySlugQuery, siteLatestAtomicTransferQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { notFound, Outlet } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { Suspense } from 'react';
import { useAuth } from '../../app/auth';
import { siteRoute } from '../../app/router/sites';
import StagingSiteSyncMonitor from '../../app/staging-site-sync-monitor';
import FlashMessage from '../../components/flash-message';
import {
	isAwaitingAtomicTransfer,
	mayBeAwaitingAtomicTransfer,
} from '../../utils/site-atomic-transfers';
import { hasStagingSite } from '../../utils/site-staging-site';
import { canManageSite } from '../features';
import SiteLaunchCelebrationModal from '../site-launch-modal/celebration-modal';

function Site() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site, isError, error } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const { user } = useAuth();
	const canManage = canManageSite( site );
	const mayBeTransferring = ! canManage && mayBeAwaitingAtomicTransfer( site, user.ID );
	const { data: transfer, isPending: isTransferPending } = useQuery( {
		...siteLatestAtomicTransferQuery( site.ID ),
		enabled: mayBeTransferring,
	} );
	// While the site turns Atomic, its owner keeps its pages: their capabilities come back with it.
	const isAwaitingTransfer =
		mayBeTransferring &&
		( isTransferPending || isAwaitingAtomicTransfer( site, user.ID, transfer ) );

	if ( isError ) {
		throw error;
	}

	if ( ! canManage && ! isAwaitingTransfer ) {
		throw notFound();
	}

	return (
		<Suspense fallback={ null }>
			{ hasStagingSite( site ) && <StagingSiteSyncMonitor site={ site } /> }
			<Suspense fallback={ null }>
				<FlashMessage
					id="route-not-allowed"
					key={ siteSlug }
					type="error"
					message={ __( 'You don’t have permission to view the requested page.' ) }
				/>
				<SiteLaunchCelebrationModal site={ site } />
				<Outlet />
			</Suspense>
		</Suspense>
	);
}

export default Site;
