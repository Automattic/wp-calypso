import { ProgressBar } from '@wordpress/components';
import { Heading } from '../../components/Heading/Heading';
import { StepContainerV2 } from '../../components/StepContainerV2/StepContainerV2';
import { TopBar } from '../../components/TopBar/TopBar';

import './style.scss';

export const Loading = ( { title, progress }: { title?: string; progress?: number } ) => {
	return (
		<StepContainerV2>
			<TopBar />
			<div className="step-container-v2--loading">
				<Heading text={ title } size="small" align="center" />
				<ProgressBar className="step-container-v2--loading__progress-bar" value={ progress } />
			</div>
		</StepContainerV2>
	);
};
