import { Step } from '@automattic/onboarding';
import { ReactNode } from 'react';
import DocumentHead from 'calypso/components/data/document-head';

type ScreenProps = {
	title: string;
	subText: ReactNode;
	children: ReactNode;
};

export const Screen = ( { title, subText, children }: ScreenProps ) => (
	<>
		<DocumentHead title={ title } />
		<Step.CenteredColumnLayout
			columnWidth={ 6 }
			topBar={ <Step.TopBar /> }
			heading={ <Step.Heading text={ title } subText={ subText } /> }
			className="student-plan-eligibility"
		>
			{ children }
		</Step.CenteredColumnLayout>
	</>
);
