import { NO_SITE_CONTEXT } from '@automattic/calypso-analytics';
import { useSelector } from 'react-redux';
import { getSiteSlugOrIdFromURLSearchParams } from 'calypso/lib/analytics/super-props';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import getPrimarySiteSlug from 'calypso/state/selectors/get-primary-site-slug';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import getSite from 'calypso/state/sites/selectors/get-site';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export function useHelpCenterSite() {
	const selectedSite = useSelector( getSelectedSite );
	const urlParamSiteId = getSiteSlugOrIdFromURLSearchParams();
	const urlParamSite = useSelector( ( state ) => getSite( state, urlParamSiteId ) );
	const primarySiteId = useSelector( getPrimarySiteId );
	const primarySiteSlug = useSelector( getPrimarySiteSlug );
	const primarySite = useSelector( ( state ) => getSiteBySlug( state, primarySiteSlug ) );

	const site = selectedSite || urlParamSite || primarySite;
	const siteId = site?.ID || primarySiteId;

	let siteContextSource = NO_SITE_CONTEXT;
	if ( selectedSite ) {
		siteContextSource = 'calypso_selected_site';
	} else if ( urlParamSite ) {
		siteContextSource = 'calypso_url_param_site';
	} else if ( primarySite || primarySiteId ) {
		siteContextSource = 'calypso_primary_site';
	}

	return {
		selectedSite,
		urlParamSite,
		primarySite,
		site,
		siteId,
		siteContextSource,
	};
}
