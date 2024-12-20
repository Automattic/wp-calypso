import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { Fragment } from 'react';

import './style.scss';

type Props = {
	steps: string[];
	current: number;
};

function getStepClassName( currentStep: number, step: number ): string {
	return clsx( {
		'is-current': currentStep === step,
		'is-next': currentStep < step,
		'is-complete': currentStep > step,
	} );
}

function Marker( { currentStep, step }: { currentStep: number; step: number } ) {
	if ( currentStep > step ) {
		return (
			<span className="a4a-layout__stepper-step-circle">
				<Gridicon icon="checkmark" size={ 16 } />
			</span>
		);
	}

	return (
		<span className="a4a-layout__stepper-step-circle">
			<span>{ step }</span>
		</span>
	);
}

export default function LayoutStepper( { steps, current }: Props ) {
	return (
		<div className="a4a-layout__stepper">
			{ steps.map( ( label, index ) => (
				<Fragment key={ `step-${ index }` }>
					<div className={ `a4a-layout__stepper-step ${ getStepClassName( current, index ) }` }>
						<Marker currentStep={ current + 1 } step={ index + 1 } />
						<span className="a4a-layout__stepper-step-name">{ label }</span>
					</div>

					{ index < steps.length - 1 && <div className="a4a-layout__stepper-step-separator" /> }
				</Fragment>
			) ) }
		</div>
	);
}
