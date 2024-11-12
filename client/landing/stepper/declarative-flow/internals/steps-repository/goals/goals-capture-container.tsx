import { StepContainer } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import FormattedHeader from 'calypso/components/formatted-header';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';

type GoalsCaptureContainerProps = {
	whatAreYourGoalsText: string;
	subHeaderText: string;
	stepName: string;
	onSkip(): void;
	goNext: NavigationControls[ 'goNext' ];
	nextLabelText: string;
	skipLabelText: string;
	stepContent: React.ReactElement;
	recordTracksEvent: ( eventName: string, eventProperties: object ) => void;
};

export const GoalsCaptureContainer: React.FC< GoalsCaptureContainerProps > = ( {
	whatAreYourGoalsText,
	subHeaderText,
	...otherProps
} ) => {
	const isMediumOrBiggerScreen = useViewportMatch( 'small', '>=' );

	return (
		<StepContainer
			{ ...otherProps }
			isHorizontalLayout={ false }
			className="goals__container two-columns"
			hideBack
			hideSkip={ false }
			hideNext={ isMediumOrBiggerScreen }
			formattedHeader={
				<FormattedHeader
					id="goals-header"
					headerText={ whatAreYourGoalsText }
					subHeaderText={ subHeaderText }
				/>
			}
		/>
	);
};
