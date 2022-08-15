import { ReactElement } from 'react';
import ProcessingStepContainer from './processing-step-container';
import type { Step } from '../../types';
import './style.scss';

const ProcessingStep: Step = function ( props ): ReactElement | null {
	return <ProcessingStepContainer navigation={ props.navigation } />;
};

export default ProcessingStep;
