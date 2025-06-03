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
							<OnboardingTourModal.Section
								key={ section.id }
								id={ section.id }
								title={ section.title }
								bannerImage={ section.bannerImage }
								renderActions={ section.renderActions }
							>
								{ section.content }
							</OnboardingTourModal.Section>
						) ) }
					</OnboardingTourModal>
				) }
			</>
		);
	};
}
