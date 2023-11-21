import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getSiteOption from '../selectors/get-site-option';

/**
 * Returns a site option for a site
 * @param optionName The option you want to query
 * @returns The value of that option or null
 */
const useSiteOption = ( optionName: string ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteOption = useSelector( ( state ) =>
		getSiteOption( state, selectedSiteId || 0, optionName )
	);

	return siteOption;
};

export default useSiteOption;
