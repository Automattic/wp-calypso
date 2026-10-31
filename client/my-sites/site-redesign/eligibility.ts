import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { isCurrentPlanPaid, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { fetchEligibility } from './api';
import type { AppState } from 'calypso/types';

export function useRedesignEligibility() {
	const site = useSelector( getSelectedSite );
	const canDesign = useSelector(
		( state: AppState ) =>
			!! site &&
			isCurrentPlanPaid( state, site.ID ) === false &&
			isJetpackSite( state, site.ID, { treatAtomicAsJetpackSite: false } ) === false &&
			canCurrentUser( state, site.ID, 'manage_options' ) &&
			canCurrentUser( state, site.ID, 'edit_theme_options' )
	);
	const siteId = site?.ID;
	const { data, isError } = useQuery( {
		queryKey: [ 'site-redesign', 'eligibility', siteId ],
		queryFn: () => fetchEligibility( siteId as number ),
		enabled: canDesign,
		staleTime: 10 * 60 * 1000,
		retry: false,
		refetchOnWindowFocus: false,
	} );
	return canDesign && ! isError && data?.can_preview === true ? site : null;
}
