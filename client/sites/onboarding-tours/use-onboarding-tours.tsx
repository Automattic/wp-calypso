import { useMemo } from 'react';
import type { TourStep } from 'calypso/components/guided-tour/data/guided-tour-context';

const useSiteManagementPanelTour = (): TourStep[] => {
	return [
		{
			id: 'site-management-panel-admin-button',
			title: '',
			description: '',
			popoverPosition: 'bottom',
			classNames: {
				nextStepButton: 'is-primary',
			},
		},
	];
};

const useOnboardingTours = () => {
	const siteManagementTour = useSiteManagementPanelTour();
	const tours = useMemo(
		() => ( {
			siteManagementTour: siteManagementTour,
		} ),
		[]
	);

	return tours;
};

export default useOnboardingTours;
