import clsx from 'clsx';

import './style.scss';

type Step = {
	label: string;
	isActive: boolean;
	isComplete: boolean;
};

type Props = {
	steps: Step[];
};

const StepProgress = ( { steps }: Props ) => {
	return (
		<div className="step-progress">
			<div className="step-progress__steps">
				<div className="step-progress__steps-container">
					{ steps.map( ( step ) => (
						<div
							key={ step.label }
							className={ clsx( 'step-progress__step', {
								'is-active': step.isActive,
								'is-complete': step.isComplete,
							} ) }
						>
							<div className="step-progress__step-indicator" />
							<span className="step-progress__step-label">{ step.label }</span>
						</div>
					) ) }
				</div>
			</div>
		</div>
	);
};

export default StepProgress;
