import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

function getStepClassName( currentStep: number, step: number ) {
	return clsx( {
		'step-current': currentStep === step,
		'step-next': currentStep < step,
		'step-complete': currentStep > step,
	} );
}

function CheckMarkOrNumber( { currentStep, step }: { currentStep: number; step: number } ) {
	if ( currentStep > step ) {
		return (
			<span className="clone-flow-step-progress__step-circle">
				<Gridicon icon="checkmark" size={ 16 } />
			</span>
		);
	}

	return (
		<span className="clone-flow-step-progress__step-circle">
			<span>{ step }</span>
		</span>
	);
}

type StepKey = 'destination' | 'clonePoint' | 'configure';

interface Step {
	key: StepKey;
	label: string;
}

interface Props {
	currentStep: StepKey;
	selectedSite?: SiteDetails | null;
}

export default function CloneFlowStepProgress( { currentStep }: Props ) {
	const translate = useTranslate();

	const steps: Step[] = [
		{ key: 'destination', label: translate( 'Set destination' ) },
		{ key: 'clonePoint', label: translate( 'Select point to copy' ) },
		{ key: 'configure', label: translate( 'Configure' ) },
	];

	const currentStepIndex = Math.max(
		steps.findIndex( ( step ) => step.key === currentStep ),
		0
	);

	return (
		<div className="clone-flow-step-progress">
			{ steps.map( ( { key, label }, index ) => (
				<Fragment key={ key }>
					<div
						className={ `clone-flow-step-progress__step ${ getStepClassName(
							currentStepIndex,
							index
						) }` }
					>
						<CheckMarkOrNumber currentStep={ currentStepIndex + 1 } step={ index + 1 } />
						<span className="clone-flow-step-progress__step-name">{ label }</span>
					</div>

					{ index < steps.length - 1 && (
						<div className="clone-flow-step-progress__step-separator" />
					) }
				</Fragment>
			) ) }
		</div>
	);
}
