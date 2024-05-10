import { useSelector } from 'react-redux';
import { isCurrentUserCurrentPlanOwner } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const useCanUserUpgradePlans = () => {
	const selectedSiteId = useSelector( getSelectedSiteId );

	return useSelector( ( state ) =>
		selectedSiteId ? isCurrentUserCurrentPlanOwner( state, selectedSiteId ) : false
	);
};

export default useCanUserUpgradePlans;
