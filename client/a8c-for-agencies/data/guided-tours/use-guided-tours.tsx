import { useMemo } from 'react';
import useAddNewSiteTour from './tours/use-add-new-site-tour';
import useMarketplaceWalkthroughTour from './tours/use-marketplace-walkthrough-tour';
import useSitesWalkthroughTour from './tours/use-sites-walkthrough-tour';

export default function useGuidedTours() {
	const sitesWalkthrough = useSitesWalkthroughTour();
	const marketplaceWalkthrough = useMarketplaceWalkthroughTour();

	const addNewSite = useAddNewSiteTour();
	const tours = useMemo(
		() => ( {
			sitesWalkthrough: sitesWalkthrough,
			marketplaceWalkthrough,
			addSiteStep1: addNewSite,
		} ),
		[ addNewSite, marketplaceWalkthrough, sitesWalkthrough ]
	);

	return tours;
}
