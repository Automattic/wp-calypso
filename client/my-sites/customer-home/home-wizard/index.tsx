import { Modal, Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import FeaturesStep from './features-step';
import GoalsStep from './goals-step';
import type { FeatureKey, GoalKey, WizardAnswers } from './types';

import './style.scss';

type Props = {
	onClose: () => void;
	onComplete: ( answers: WizardAnswers ) => void;
};

const TOTAL_STEPS = 2;

export default function HomeWizard( { onClose, onComplete }: Props ) {
	const translate = useTranslate();
	const [ step, setStep ] = useState< 0 | 1 >( 0 );
	const [ goal, setGoal ] = useState< GoalKey | null >( null );
	const [ features, setFeatures ] = useState< FeatureKey[] >( [] );

	const isLast = step === TOTAL_STEPS - 1;
	const canContinue = step === 0 ? goal !== null : true;

	const handleNext = () => {
		if ( isLast ) {
			onComplete( { goal, features } );
			return;
		}
		setStep( ( step + 1 ) as 0 | 1 );
	};

	const handleBack = () => {
		if ( step === 0 ) {
			return;
		}
		setStep( ( step - 1 ) as 0 | 1 );
	};

	return (
		<Modal
			title=""
			onRequestClose={ onClose }
			className="home-wizard"
			shouldCloseOnClickOutside={ false }
			__experimentalHideHeader
			size="medium"
		>
			<div className="home-wizard__progress" aria-hidden="true">
				<div
					className="home-wizard__progress-bar"
					style={ { width: `${ ( ( step + 1 ) / TOTAL_STEPS ) * 100 }%` } }
				/>
			</div>

			{ step === 0 && <GoalsStep value={ goal } onChange={ setGoal } /> }
			{ step === 1 && <FeaturesStep value={ features } onChange={ setFeatures } /> }

			<footer className="home-wizard__footer">
				<Button variant="tertiary" onClick={ onClose }>
					{ translate( 'Skip' ) }
				</Button>
				<div className="home-wizard__footer-right">
					{ step > 0 && (
						<Button variant="secondary" onClick={ handleBack }>
							{ translate( 'Back' ) }
						</Button>
					) }
					<Button variant="primary" onClick={ handleNext } disabled={ ! canContinue }>
						{ isLast ? translate( 'Finish' ) : translate( 'Continue' ) }
					</Button>
				</div>
			</footer>
		</Modal>
	);
}
