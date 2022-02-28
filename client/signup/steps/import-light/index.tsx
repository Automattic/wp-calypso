import classnames from 'classnames';
import React from 'react';
import StepWrapper from 'calypso/signup/step-wrapper';
import Capture from './capture';
import Colors from './colors';
import Scanning from './scanning';
import type { FunctionComponent } from 'react';

import './style.scss';

interface Props {
	stepName: string;
	stepSectionName: string;
}
const ImportLight: FunctionComponent< Props > = ( props ) => {
	const colors = [
		{ name: 'Color 1', hex: '#17273A' },
		{ name: 'Color 2', hex: '#283A50' },
		{ name: 'Color 3', hex: '#EFEBEB' },
		{ name: 'Color 4', hex: '#94A4B9' },
	];

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
					{ props.stepSectionName === 'colors' && <Colors colors={ colors } /> }
				</div>
			}
		/>
	);
};

export default ImportLight;
