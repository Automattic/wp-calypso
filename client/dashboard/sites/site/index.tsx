import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound, Outlet } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { Suspense } from 'react';
import { siteRoute } from '../../app/router/sites';
import StagingSiteSyncMonitor from '../../app/staging-site-sync-monitor';
import FlashMessage from '../../components/flash-message';
import { hasStagingSite } from '../../utils/site-staging-site';
import { canManageSite } from '../features';
import SiteLaunchCelebrationModal from '../site-launch-celebration-modal';

function Site() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site, isError, error } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	if ( isError ) {
		throw error;
	}

	if ( ! canManageSite( site ) ) {
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
