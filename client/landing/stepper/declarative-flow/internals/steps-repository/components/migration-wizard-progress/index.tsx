import { Step } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';

import './style.scss';

export interface MigrationWizardProgressStep {
	slug: string;
	label: string;
}

interface Props {
	steps: MigrationWizardProgressStep[];
	current: string;
}

export function MigrationWizardProgress( { steps, current }: Props ) {
	const { __ } = useI18n();

	const currentIndex = steps.findIndex( ( step ) => step.slug === current );

	if ( currentIndex === -1 ) {
		return null;
	}

	const total = steps.length;
	const currentNumber = currentIndex + 1;
	const currentLabel = steps[ currentIndex ].label;

	return (
		<div className="migration-wizard-progress">
			{ /* The bar below repeats this through `aria-valuetext`, so hide the duplicate. */ }
			<p className="migration-wizard-progress__counter" aria-hidden="true">
				{ createInterpolateElement(
					sprintf(
						/* translators: %s: name of the current step, e.g. “Scan”. <counter /> renders “2 of 7”. */
						__( 'Step <counter /> · %s' ),
						currentLabel
					),
					{ counter: <Step.StepCounter current={ currentNumber } total={ total } /> }
				) }
			</p>
			<div
				className="migration-wizard-progress__track"
				role="progressbar"
				aria-label={ __( 'Migration progress' ) }
				aria-valuemin={ 1 }
				aria-valuemax={ total }
				aria-valuenow={ currentNumber }
				aria-valuetext={ sprintf(
					/* translators: 1: current step number. 2: total number of steps. 3: name of the current step, e.g. “Scan”. */
					__( 'Step %1$d of %2$d: %3$s' ),
					currentNumber,
					total,
					currentLabel
				) }
			>
				{ steps.map( ( step, index ) => (
					<span
						key={ step.slug }
						className={ clsx( 'migration-wizard-progress__segment', {
							'is-filled': index <= currentIndex,
							'is-current': index === currentIndex,
						} ) }
					>
						<span className="migration-wizard-progress__segment-bar" />
						<span className="migration-wizard-progress__segment-label">{ step.label }</span>
					</span>
				) ) }
			</div>
		</div>
	);
}

export default MigrationWizardProgress;
