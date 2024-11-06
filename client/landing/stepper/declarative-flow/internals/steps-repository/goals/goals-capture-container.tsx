import { StepContainer } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';

type GoalsCaptureContainerProps = {
	whatAreYourGoalsText: string;
	subHeaderText: string;
	stepName: string;
	onSkip(): void;
	goNext: NavigationControls[ 'goNext' ];
	nextLabelText: string;
	stepContent: React.ReactElement;
	recordTracksEvent: ( eventName: string, eventProperties: object ) => void;
};

export const GoalsCaptureContainer: React.FC< GoalsCaptureContainerProps > = ( {
	whatAreYourGoalsText,
	subHeaderText,
	...otherProps
} ) => {
	const translate = useTranslate();
	const isMediumOrBiggerScreen = useViewportMatch( 'small', '>=' );

	return (
		<StepContainer
			{ ...otherProps }
			isHorizontalLayout={ false }
			className="goals__container two-columns"
			hideBack
			hideSkip={ false }
			skipLabelText={ translate( 'Skip' ) }
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
