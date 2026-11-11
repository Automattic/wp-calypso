import { isEnabled } from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { isCurrentPlanPaid, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
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
	return isEnabled( 'themes/site-redesign' ) && canDesign ? site : null;
}
