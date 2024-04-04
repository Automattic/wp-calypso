import useAddNewSiteTour from './tours/use-add-new-site-tour';
import useSitesWalkthroughTour from './tours/use-sites-walkthrough-tour';

export type TourId = 'sites-walkthrough' | 'add-site-step-1';

export default function useGuidedTour( id: TourId | null ) {
	const sitesWalkthrough = useSitesWalkthroughTour();
	const addNewSite = useAddNewSiteTour();

	const tours = {
		'sites-walkthrough': sitesWalkthrough,
		'add-site-step-1': addNewSite,
	};

	return id ? tours[ id ] : [];
}
