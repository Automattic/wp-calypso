import WelcomeTourCard from './tour-card';
import { useWelcomeTourContext } from './tour-context';
import type { TourStepRenderer } from '@automattic/packaged-tour';

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
	const { justMaximized, setJustMaximized } = useWelcomeTourContext();

	return (
		<WelcomeTourCard
			cardContent={ steps[ currentStepIndex ].meta }
			currentStepIndex={ currentStepIndex }
			justMaximized={ justMaximized }
			lastStepIndex={ lastStepIndex }
			onDismiss={ onDismiss }
			onMinimize={ onMinimize }
			setJustMaximized={ setJustMaximized }
			setCurrentStepIndex={ onGoToStep }
			onNextStepProgression={ onNext }
			onPreviousStepProgression={ onPrevious }
			isGutenboarding={ isGutenboarding }
			setInitialFocusedElement={ setInitialFocusedElement }
		/>
	);
};

export default WelcomeTourStep;
