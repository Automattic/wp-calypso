import { isEnabled } from '@automattic/calypso-config';
import React from 'react';
import StepWrapper from 'calypso/signup/step-wrapper';
import WixImporter from './wix';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	stepName: string;
	stepSectionName: string;
}

const ImportOnboardingFrom: React.FunctionComponent< Props > = ( props ) => {
	const { stepSectionName } = props;
	return (
		<StepWrapper
			flowName={ 'import-from' }
			hideSkip={ true }
			hideBack={ true }
			hideNext={ true }
			hideFormattedHeader={ true }
			stepContent={
				<div className="import__onboarding-page">
					{ stepSectionName === 'wix' && isEnabled( 'gutenboarding/import-from-wix' ) && (
						<WixImporter />
					) }
				</div>
			}
		/>
	);
};

export default ImportOnboardingFrom;
