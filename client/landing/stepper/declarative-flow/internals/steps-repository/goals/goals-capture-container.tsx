import { StepContainer } from '@automattic/onboarding';
import intentImageUrl from 'calypso/assets/images/onboarding/intent.svg';
import FormattedHeader from 'calypso/components/formatted-header';

type GoalsCaptureContainerProps = {
	displayAllGoals?: boolean;
	welcomeText: string;
	whatAreYourGoalsText: string;
	subHeaderText: string;
	stepName: string;
	goNext: () => void;
	skipLabelText: string;
	skipButtonAlign?: 'top' | 'bottom';
	hideBack: boolean;
	stepContent: React.ReactElement;
	recordTracksEvent: ( eventName: string, eventProperties: object ) => void;
};

// Goals Capture: Iteration 1 UI, one column layout
const GCOneColumnContainer: React.VFC< GoalsCaptureContainerProps > = ( {
	welcomeText,
	whatAreYourGoalsText,
	subHeaderText,
	...otherProps
} ) => (
	<StepContainer
		{ ...otherProps }
		isHorizontalLayout={ true }
		headerImageUrl={ intentImageUrl }
		className="goals__container one-column"
		formattedHeader={
			<FormattedHeader
				id="goals-header"
				headerText={
					<>
						{ welcomeText } <br /> { whatAreYourGoalsText }
					</>
				}
				subHeaderText={ subHeaderText }
			/>
		}
	/>
);

// Goals Capture: Iteration 2 UI, two columns layout
const GCTwoColumnContainer: React.VFC< GoalsCaptureContainerProps > = ( {
	whatAreYourGoalsText,
	subHeaderText,
	...otherProps
} ) => (
	<StepContainer
		{ ...otherProps }
		isHorizontalLayout={ false }
		className="goals__container two-columns"
		formattedHeader={
			<FormattedHeader
				id="goals-header"
				headerText={ whatAreYourGoalsText }
				subHeaderText={ subHeaderText }
			/>
		}
	/>
);

export const GoalsCaptureContainer: React.VFC< GoalsCaptureContainerProps > = ( {
	displayAllGoals,
	...props
} ) =>
	displayAllGoals ? <GCTwoColumnContainer { ...props } /> : <GCOneColumnContainer { ...props } />;
