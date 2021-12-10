import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getSiteOption from '../selectors/get-site-option';

/**
 * Returns a site option for a site
 *
 * @param optionName The option you want to query
 * @returns The value of that option or null
 */
const useSiteOption = < T >( optionName: string ): T | null => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteOption = useSelector( ( state ) =>
		getSiteOption( state, selectedSiteId || 0, optionName )
	);

	return siteOption;
};

export default useSiteOption;
