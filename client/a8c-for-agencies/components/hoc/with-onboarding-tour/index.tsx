import { ComponentType } from 'react';
import OnboardingTourModal from '../../onboarding-tour-modal';
import useOnboardingTour from './hooks/use-onboarding-tour';
import useOnboardingTourSections from './hooks/use-onboarding-tour-sections';

import './style.scss';

export function withOnboardingTour< T extends JSX.IntrinsicAttributes >(
	WrappedComponent: ComponentType< T >
) {
	return function WithOnboardingTourWrapper( props: T ) {
		const { isOpen, onClose } = useOnboardingTour();

		const sections = useOnboardingTourSections();

		return (
			<>
				<WrappedComponent { ...props } />
				{ isOpen && (
					<OnboardingTourModal onClose={ onClose }>
						{ sections.map( ( section ) => (
							<OnboardingTourModal.Section key={ section.id } { ...section }>
								<OnboardingTourModal.SectionContent
									title={ section.content.title }
									descriptions={ section.content.descriptions }
									hint={ section.content.hint }
								/>
							</OnboardingTourModal.Section>
						) ) }
					</OnboardingTourModal>
				) }
			</>
		);
	};
}
