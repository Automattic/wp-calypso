import { ReactElement } from 'react';
import ProcessingStepContainer from '../processing-step/processing-step-container';
import type { Step } from '../../types';
import './styles.scss';

const LinkInBioProcessingStep: Step = function ( props ): ReactElement | null {
	return (
		<div>
			<div className="image-right" />
			<div className="image-left" />
			<ProcessingStepContainer
				navigation={ props.navigation }
				isHorizontalLayout={ false }
				isJetpackPowered={ true }
			/>
		</div>
	);
};

export default LinkInBioProcessingStep;
