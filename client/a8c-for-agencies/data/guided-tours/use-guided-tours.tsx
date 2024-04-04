import useAddNewSiteTour from './tours/use-add-new-site-tour';
import useSitesWalkthroughTour from './tours/use-sites-walkthrough-tour';

export type TourId = 'sitesWalkthrough' | 'addSiteStep1';

export default function useGuidedTour( id: TourId | null ) {
	const sitesWalkthrough = useSitesWalkthroughTour();
	const addNewSite = useAddNewSiteTour();

	const tours = {
		sitesWalkthrough: sitesWalkthrough,
		addSiteStep1: addNewSite,
	};

	return id ? tours[ id ] : [];
}
