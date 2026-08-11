import { useSelector } from 'react-redux';
import { getSiteSlugOrIdFromURLSearchParams } from 'calypso/lib/analytics/super-props';
import getPrimarySiteSlug from 'calypso/state/selectors/get-primary-site-slug';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import getSite from 'calypso/state/sites/selectors/get-site';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export function useHelpCenterSite() {
	const selectedSite = useSelector( getSelectedSite );
	const urlParamSiteId = getSiteSlugOrIdFromURLSearchParams();
	const urlParamSite = useSelector( ( state ) => getSite( state, urlParamSiteId ) );
	const primarySiteSlug = useSelector( getPrimarySiteSlug );
	const primarySite = useSelector( ( state ) => getSiteBySlug( state, primarySiteSlug ) );

	return {
		selectedSite,
		urlParamSite,
		primarySite,
		site: selectedSite || urlParamSite || primarySite,
	};
}
