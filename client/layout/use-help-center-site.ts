import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getSiteSlugOrIdFromURLSearchParams } from 'calypso/lib/analytics/super-props';
import getPrimarySiteSlug from 'calypso/state/selectors/get-primary-site-slug';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import getSite from 'calypso/state/sites/selectors/get-site';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { SiteCandidate } from '@automattic/calypso-analytics';

export function useHelpCenterSite() {
	const selectedSite = useSelector( getSelectedSite );
	const urlParamSiteId = getSiteSlugOrIdFromURLSearchParams();
	const urlParamSite = useSelector( ( state ) => getSite( state, urlParamSiteId ) );
	const primarySiteSlug = useSelector( getPrimarySiteSlug );
	const primarySite = useSelector( ( state ) => getSiteBySlug( state, primarySiteSlug ) );

	// The same order as `site`, kept as candidates so events can report which one they got.
	const siteCandidates: SiteCandidate[] = useMemo(
		() => [
			[ 'calypso_selected_site', selectedSite?.ID ],
			[ 'calypso_url_param_site', urlParamSite?.ID ],
			[ 'calypso_primary_site', primarySite?.ID ],
		],
		[ selectedSite?.ID, urlParamSite?.ID, primarySite?.ID ]
	);

	return {
		selectedSite,
		urlParamSite,
		primarySite,
		siteCandidates,
		site: selectedSite || urlParamSite || primarySite,
	};
}
