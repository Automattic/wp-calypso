import classnames from 'classnames';
import React from 'react';
import StepWrapper from 'calypso/signup/step-wrapper';
import Capture from './capture';
import Scanning from './scanning';
import type { FunctionComponent } from 'react';

import './style.scss';

interface Props {
	stepName: string;
	stepSectionName: string;
}
const ImportLight: FunctionComponent< Props > = ( props ) => {
	return (
		<StepWrapper
			flowName={ 'import-light' }
			stepName={ props.stepName }
			stepSectionName={ props.stepSectionName }
			hideSkip={ false }
			hideNext={ false }
			hideBack={ false }
			hideFormattedHeader={ true }
			nextLabelText={ 'Skip this step' }
			shouldHideNavButtons={ false }
			stepContent={
				<div className={ classnames( 'import__onboarding-page' ) }>
					{ ! props.stepSectionName && <Capture /> }
					{ props.stepSectionName === 'scanning' && <Scanning /> }
				</div>
			}
		/>
	);
};

export default ImportLight;
