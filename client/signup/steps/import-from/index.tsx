import React from 'react';
import StepWrapper from 'calypso/signup/step-wrapper';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	stepName: string;
	stepSectionName: string;
}

const ImportOnboardingFrom: React.FunctionComponent< Props > = ( props ) => {
	return (
		<StepWrapper
			flowName={ 'import-from' }
			hideSkip={ true }
			hideBack={ true }
			hideNext={ true }
			hideFormattedHeader={ true }
			stepContent={
				<div className="import__onboarding-page">Import from { props.stepSectionName }</div>
			}
		/>
	);
};

export default ImportOnboardingFrom;
