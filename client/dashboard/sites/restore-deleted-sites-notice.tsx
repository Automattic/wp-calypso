import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAuth } from '../app/auth';
import { useAppContext } from '../app/context';
import ComponentViewTracker from '../components/component-view-tracker';
import Notice from '../components/notice';
import RouterLinkButton from '../components/router-link-button';
import { deletedSitesCheckFetchOptions, hasNoLiveSites } from './deleted-sites';

/**
 * Whether the restore-deleted-sites notice is eligible to show. Read at the
 * call site so the notice never decides its own visibility inside the arbiter.
 * See client/dashboard/sites/AGENTS.md.
 */
export function useShouldShowRestoreDeletedSitesNotice() {
	const { user } = useAuth();
	const { queries } = useAppContext();
	const noLiveSites = hasNoLiveSites( user );

	// Holds the full-page loader so eligibility is settled before first paint.
	const { data } = useQuery( {
		...queries.paginatedSitesQuery( deletedSitesCheckFetchOptions ),
		enabled: noLiveSites,
		meta: { fullPageLoader: true },
	} );

	return noLiveSites && ( data?.total ?? 0 ) > 0;
}

export function RestoreDeletedSitesNotice() {
	const [ isDismissed, setIsDismissed ] = useState( false );

	if ( isDismissed ) {
		return null;
	}

	return (
		<>
			<ComponentViewTracker eventName="calypso_dashboard_sites_restore_deleted_sites_notice_impression" />
			<Notice
				title={ __( 'You have deleted sites' ) }
				onClose={ () => setIsDismissed( true ) }
				actions={
					<RouterLinkButton
						to="/sites"
						search={ { is_deleted: true } }
						variant="primary"
						__next40pxDefaultSize
					>
						{ __( 'View deleted sites' ) }
					</RouterLinkButton>
				}
			>
				{ __( 'Deleted sites can be restored within 30 days of deletion.' ) }
			</Notice>
		</>
	);
}
