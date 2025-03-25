import { Step } from '@automattic/onboarding';
import { ReactNode } from 'react';
import './step-container-v2-plans-styles.scss';

type StepContainerV2PlansProps = {
	headerText: ReactNode;
	subHeaderText: ReactNode;
	children: React.ReactNode;
	goBack?: () => void;
	backLabelText?: string;
};

const StepContainerV2Plans = ( {
	headerText,
	subHeaderText,
	children,
	goBack,
	backLabelText,
}: StepContainerV2PlansProps ) => {
	return (
		<Step.FullWidthLayout
			className="step-container-v2--plans"
			topBar={
				<Step.TopBar
					backButton={
						goBack ? <Step.BackButton onClick={ goBack } label={ backLabelText } /> : undefined
					}
				/>
			}
			heading={ <Step.Heading text={ headerText } subText={ subHeaderText } /> }
		>
			{ children }
		</Step.FullWidthLayout>
	);
};

export default StepContainerV2Plans;
