import { Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import { useSelector } from 'react-redux';
import {
	hasValidPaymentMethod,
	isAgencyUser,
} from 'calypso/state/partner-portal/partner/selectors';
import type { ReactChild, ReactElement } from 'react';
import './style.scss';

function getStepClassName( currentStep: number, step: number ): any {
	return classnames( {
		'step-current': currentStep === step,
		'step-next': currentStep < step,
		'step-complete': currentStep > step,
	} );
}

function CheckMarkOrNumber( {
	currentStep,
	step,
}: {
	currentStep: number;
	step: number;
} ): ReactElement {
	if ( currentStep > step ) {
		return (
			<span className="assign-license-step-progress__step-circle">
				<Gridicon icon="checkmark" size={ 16 } />
			</span>
		);
	}

	return (
		<span className="assign-license-step-progress__step-circle">
			<span>{ step }</span>
		</span>
	);
}

type StepKey = 'issueLicense' | 'addPaymentMethod' | 'assignLicense';

interface Step {
	key: StepKey;
	label: ReactChild | null;
}

interface Props {
	currentStep: StepKey;
}

export default function AssignLicenseStepProgress( { currentStep }: Props ): ReactElement {
	const translate = useTranslate();
	const isAgency = useSelector( isAgencyUser );
	const hasPaymentMethod = useSelector( hasValidPaymentMethod );
	const paymentMethodRequired = isAgency && ! hasPaymentMethod;

	const steps: Step[] = [
		{ key: 'issueLicense', label: translate( 'Issue new license' ) },
		...( paymentMethodRequired
			? [ { key: 'addPaymentMethod', label: translate( 'Add Payment Method' ) } as Step ]
			: [] ),
		{ key: 'assignLicense', label: translate( 'Assign license' ) },
	];

	const currentStepIndex = Math.max(
		steps.findIndex( ( step ) => step.key === currentStep ),
		0
	);

	return (
		<div className="assign-license-step-progress">
			{ steps.map( ( { key, label }, index ) => (
				<Fragment key={ key }>
					<div
						className={ `assign-license-step-progress__step ${ getStepClassName(
							currentStepIndex,
							index
						) }` }
					>
						<CheckMarkOrNumber currentStep={ currentStepIndex + 1 } step={ index + 1 } />
						<span className="assign-license-step-progress__step-name">{ label }</span>
					</div>

					{ index < steps.length - 1 && (
						<div className="assign-license-step-progress__step-separator" />
					) }
				</Fragment>
			) ) }
		</div>
	);
}
