import { ProgressBar } from '@automattic/components';
import clsx from 'clsx';

import './style.scss';

type Step = {
	label: string;
	isActive: boolean;
	value?: number;
};

type Props = {
	steps: Step[];
};

const StepProgress = ( { steps }: Props ) => {
	return (
		<div className="step-progress">
			<div className="step-progress__steps">
				<div
					className={ clsx( 'step-progress__steps-container', {
						'is-two-columns': steps.length < 3,
					} ) }
				>
					{ steps.map( ( step ) => (
						<div
							key={ step.label }
							className={ clsx( 'step-progress__step', {
								'is-active': step.isActive,
							} ) }
						>
							<span className="step-progress__step-label">{ step.label }</span>
							<ProgressBar value={ step.value ?? 0 } total={ 100 } canGoBackwards />
						</div>
					) ) }
				</div>
			</div>
		</div>
	);
};

export default StepProgress;
