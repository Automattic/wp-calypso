import { Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import './style.scss';

function getStepClassName( currentStep: number, step: number ): any {
	return classnames( {
		'step-current': currentStep === step,
		'step-next': currentStep < step,
		'step-complete': currentStep > step,
	} );
}

export default function ( { currentStep }: { currentStep: number } ): ReactElement {
	const translate = useTranslate();

	return (
		<div className="assign-license-step-progress">
			<div
				className={ `assign-license-step-progress__step ${ getStepClassName( currentStep, 1 ) }` }
			>
				<span className="assign-license-step-progress__step-circle">
					<Gridicon icon="checkmark" />
				</span>
				<span className="assign-license-step-progress__step-name">
					{ translate( 'Issue new license' ) }
				</span>
			</div>
			<div className="assign-license-step-progress__step-separator" />
			<div
				className={ `assign-license-step-progress__step ${ getStepClassName( currentStep, 2 ) }` }
			>
				<span className="assign-license-step-progress__step-circle">
					<span>2</span>
				</span>
				<span className="assign-license-step-progress__step-name">
					{ translate( 'Assign license' ) }
				</span>
			</div>
		</div>
	);
}
