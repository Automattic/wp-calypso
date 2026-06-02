import { Modal, Button } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import DetailsStep from './details-step';
import GoalsStep from './goals-step';
import type { GoalKey, WizardAnswers } from './types';

import './style.scss';

type Props = {
	// Existing site title (blogname) — usually set when the user picked a
	// domain. Pre-fills the Name input so users don't retype it, and acts as
	// the baseline for detecting whether they want to rename the site.
	initialSiteName?: string;
	onClose: () => void;
	onComplete: ( answers: WizardAnswers ) => void;
	// Fired with the current draft of the user's answers whenever they pause
	// typing on Step 2. The parent uses this to kick off the Dolly call early
	// so the agent's ~30s of pre-output work overlaps with the user's typing
	// time instead of starting fresh on Continue.
	onPrewarm?: ( answers: WizardAnswers ) => void;
};

const TOTAL_STEPS = 2;
const PREWARM_DEBOUNCE_MS = 1_500;

export default function HomeWizard( {
	initialSiteName = '',
	onClose,
	onComplete,
	onPrewarm,
}: Props ) {
	const translate = useTranslate();
	const [ step, setStep ] = useState< 0 | 1 >( 0 );
	const [ goal, setGoal ] = useState< GoalKey | null >( null );
	const [ siteName, setSiteName ] = useState< string >( initialSiteName );
	const [ intent, setIntent ] = useState< string >( '' );

	// Pre-fetch on Step 2 textarea pause. Cancelled whenever the user keeps
	// editing — `prewarmTailorAndDraft` aborts the in-flight call and starts
	// a new one with the latest text, so only the final pause does real work.
	useEffect( () => {
		if ( step !== 1 || ! goal ) {
			return;
		}
		if ( ! intent.trim() ) {
			return;
		}
		const handle = setTimeout( () => {
			onPrewarm?.( { goal, siteName, intent } );
		}, PREWARM_DEBOUNCE_MS );
		return () => clearTimeout( handle );
	}, [ step, goal, siteName, intent, onPrewarm ] );

	const isLast = step === TOTAL_STEPS - 1;
	// Goal is the only required field. Step 2 (details) is optional — empty
	// submission falls through to the generic Launchpad on /home.
	const canContinue = step === 0 ? goal !== null : true;

	const handleNext = () => {
		if ( isLast ) {
			onComplete( { goal, siteName, intent } );
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
			{ step === 1 && (
				<DetailsStep
					goal={ goal }
					siteName={ siteName }
					intent={ intent }
					onSiteNameChange={ setSiteName }
					onIntentChange={ setIntent }
				/>
			) }

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
