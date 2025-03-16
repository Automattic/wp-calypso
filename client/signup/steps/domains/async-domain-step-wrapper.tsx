import { Step } from '@automattic/onboarding';

interface AsyncDomainStepWrapperProps {
	hideBack: boolean;
	backLabelText: string;
	backUrl: string;
	isExternalBackUrl: boolean;
	headerText: string;
	fallbackSubHeaderText: string;
	goBack: () => void;
	mainContent: React.ReactNode;
}

export default function AsyncDomainStepWrapper( props: AsyncDomainStepWrapperProps ) {
	const {
		hideBack,
		backLabelText,
		backUrl,
		isExternalBackUrl,
		headerText,
		fallbackSubHeaderText,
		goBack,
		mainContent,
	} = props;

	const backButton = (
		<Step.BackButton
			href={ backUrl }
			rel={ isExternalBackUrl ? 'external' : '' }
			onClick={ goBack }
		>
			{ backLabelText }
		</Step.BackButton>
	);

	return (
		<Step.ThreeColumnsOnRightLayout
			className="step-container-v2--domains"
			topBar={ <Step.TopBar backButton={ ! hideBack && backButton } /> }
			heading={ <Step.Heading text={ headerText } subText={ fallbackSubHeaderText } /> }
			render={ () => mainContent }
		/>
	);
}
