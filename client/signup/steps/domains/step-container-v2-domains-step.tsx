import { Step } from '@automattic/onboarding';

interface StepContainerV2DomainsStepProps {
	hideBack: boolean;
	backLabelText: string;
	backUrl: string;
	isExternalBackUrl: boolean;
	headerText: string;
	subHeaderText: string;
	goBack: () => void;
	mainContent: React.ReactNode;
	rightContent: React.ReactNode;
	className: string;
}

export const StepContainerV2DomainsStep = ( props: StepContainerV2DomainsStepProps ) => {
	const {
		hideBack,
		backLabelText,
		backUrl,
		isExternalBackUrl,
		headerText,
		subHeaderText,
		goBack,
		mainContent,
		rightContent,
		className,
	} = props;

	const backButton = (
		<Step.BackButton
			href={ backUrl }
			rel={ isExternalBackUrl ? 'external' : '' }
			onClick={ goBack }
			label={ backLabelText }
		/>
	);

	return (
		<Step.TwoColumnLayout
			firstColumnWidth={ 7 }
			secondColumnWidth={ 3 }
			topBar={ <Step.TopBar backButton={ ! hideBack && backButton } /> }
			heading={ <Step.Heading text={ headerText } subText={ subHeaderText } /> }
			className={ className }
		>
			{ mainContent }
			{ rightContent }
		</Step.TwoColumnLayout>
	);
};
