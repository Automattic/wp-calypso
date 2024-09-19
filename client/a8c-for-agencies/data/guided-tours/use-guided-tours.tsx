import { useMemo } from 'react';
import useAddNewSiteTour from './tours/use-add-new-site-tour';
import useSitesWalkthroughTour from './tours/use-sites-walkthrough-tour';

export default function useGuidedTours() {
	const sitesWalkthrough = useSitesWalkthroughTour();
	const addNewSite = useAddNewSiteTour();
	const tours = useMemo(
		() => ( {
			sitesWalkthrough: sitesWalkthrough,
			addSiteStep1: addNewSite,
		} ),
		[]
	);

	return tours;
}
