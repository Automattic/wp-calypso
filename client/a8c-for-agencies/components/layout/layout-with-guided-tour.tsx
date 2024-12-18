import { ComponentProps } from 'react';
import { GuidedTourContextProvider } from 'calypso/a8c-for-agencies/data/guided-tours/guided-tour-context';
import useGuidedTours from 'calypso/a8c-for-agencies/data/guided-tours/use-guided-tours';
import {
	A4A_ONBOARDING_TOURS_PREFERENCE_NAME,
	A4A_ONBOARDING_TOURS_EVENT_NAMES,
} from 'calypso/a8c-for-agencies/sections/onboarding-tours/constants';
import Layout from 'calypso/layout/multi-sites-dashboard';

export function LayoutWithGuidedTour( { ...props }: ComponentProps< typeof Layout > ) {
	const guidedTours = useGuidedTours();

	return (
		<GuidedTourContextProvider
			guidedTours={ guidedTours }
			preferenceNames={ A4A_ONBOARDING_TOURS_PREFERENCE_NAME }
			eventNames={ A4A_ONBOARDING_TOURS_EVENT_NAMES }
		>
			<Layout { ...props } />
		</GuidedTourContextProvider>
	);
}
