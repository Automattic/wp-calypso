import WelcomeTourCard from './tour-card';
import type { TourStepRenderer } from '@automattic/tour-kit';

const WelcomeTourStep: TourStepRenderer = ( {
	steps,
	currentStepIndex,
	onDismiss,
	onNext,
	onPrevious,
	onMinimize,
	setInitialFocusedElement,
	onGoToStep,
} ) => {
	const lastStepIndex = steps.length - 1;
	const isGutenboarding = window.calypsoifyGutenberg?.isGutenboarding;

	return (
		<WelcomeTourCard
			cardContent={ steps[ currentStepIndex ].meta }
			currentStepIndex={ currentStepIndex }
			lastStepIndex={ lastStepIndex }
			onDismiss={ onDismiss }
			onMinimize={ onMinimize }
			setCurrentStepIndex={ onGoToStep }
			onNextStepProgression={ onNext }
			onPreviousStepProgression={ onPrevious }
			isGutenboarding={ isGutenboarding }
			setInitialFocusedElement={ setInitialFocusedElement }
		/>
	);
};

export default WelcomeTourStep;
