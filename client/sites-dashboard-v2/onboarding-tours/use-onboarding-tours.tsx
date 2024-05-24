import { useMemo } from 'react';

const useSiteManagementPanelTour = () => {
	return [
		{
			id: 'site-management-panel-admin-button',
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
