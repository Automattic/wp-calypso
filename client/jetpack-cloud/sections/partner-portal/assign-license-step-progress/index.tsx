import { Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import { useSelector } from 'react-redux';
import { doesPartnerRequireAPaymentMethod } from 'calypso/state/partner-portal/partner/selectors';
import getSites from 'calypso/state/selectors/get-sites';
import type { SiteDetails } from '@automattic/data-stores';
import type { ReactChild } from 'react';

import './style.scss';

function getStepClassName( currentStep: number, step: number ): any {
	return classnames( {
		'step-current': currentStep === step,
		'step-next': currentStep < step,
		'step-complete': currentStep > step,
	} );
}

function CheckMarkOrNumber( { currentStep, step }: { currentStep: number; step: number } ) {
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
	selectedSite?: SiteDetails | null;
}

export default function AssignLicenseStepProgress( { currentStep, selectedSite }: Props ) {
	const translate = useTranslate();
	const paymentMethodRequired = useSelector( doesPartnerRequireAPaymentMethod );
	const sites = useSelector( getSites ).length;

	const steps: Step[] = [ { key: 'issueLicense', label: translate( 'Issue new license' ) } ];

	if ( paymentMethodRequired ) {
		steps.push( { key: 'addPaymentMethod', label: translate( 'Add Payment Method' ) } );
	}

	if ( sites > 0 && ! selectedSite ) {
		steps.push( { key: 'assignLicense', label: translate( 'Assign license' ) } );
	}

	// Don't show the breadcrumbs if we have less than 2 as they are not very informative in this case.
	if ( steps.length < 2 ) {
		return null;
	}

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
