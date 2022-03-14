import { useSelector } from 'react-redux';
import { isSimpleSeller } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Returns true if the current site is a simple seller site (payment block, no Woo plan)
 *
 * @returns boolean
 */
const useIsSimpleSeller = (): boolean | null => {
	const selectedSiteId = useSelector( getSelectedSiteId );

	return useSelector( ( state ) => isSimpleSeller( state, selectedSiteId || 0 ) );
};

export default useIsSimpleSeller;
