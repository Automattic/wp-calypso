import { StepContainer } from '@automattic/onboarding';
import FormattedHeader from 'calypso/components/formatted-header';

type GoalsCaptureContainerProps = {
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

export const GoalsCaptureContainer: React.VFC< GoalsCaptureContainerProps > = ( {
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
