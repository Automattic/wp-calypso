import page from '@automattic/calypso-router';
import { __ } from '@wordpress/i18n';
import { chevronLeft } from '@wordpress/icons';
import { isOnNewAgencyDashboard } from 'calypso/dashboard/agency/lib/dashboard-opt-in';
import { buildDashboardLink } from 'calypso/dashboard/app/routing';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { A4A_OVERVIEW_LINK } from '../lib/constants';

/**
 * The back button for sections that stay here for agencies on the Multi-site Dashboard, like
 * Amplify and Reports. It leads those agencies straight back to the new dashboard's overview.
 */
export default function useBackToOverviewButtonProps() {
	const agency = useSelector( getActiveAgency );
	const isOnNewDashboard = isOnNewAgencyDashboard( agency );

	return {
		label: __( 'Back to overview' ),
		icon: chevronLeft,
		onClick: () => {
			if ( isOnNewDashboard ) {
				window.location.href = buildDashboardLink( 'a4a', '/overview' );
				return;
			}

			page( A4A_OVERVIEW_LINK );
		},
	};
}
