import { Modal, Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import PromptStep from './prompt-step';
import type { WizardAnswers } from './types';

import './style.scss';

type Props = {
	onClose: () => void;
	onComplete: ( answers: WizardAnswers ) => void;
};

const MIN_PROMPT_CHARS = 12;

export default function HomeWizard( { onClose, onComplete }: Props ) {
	const translate = useTranslate();
	const [ prompt, setPrompt ] = useState< string >( '' );

	const canSubmit = prompt.trim().length >= MIN_PROMPT_CHARS;

	const handleSubmit = () => {
		if ( ! canSubmit ) {
			return;
		}
		onComplete( { prompt: prompt.trim(), goal: null, features: [] } );
	};

	return (
		<Modal
			title=""
			onRequestClose={ onClose }
			className="home-wizard home-wizard--prompt"
			shouldCloseOnClickOutside={ false }
			__experimentalHideHeader
			size="medium"
		>
			<PromptStep value={ prompt } onChange={ setPrompt } />

			<footer className="home-wizard__footer">
				<Button variant="tertiary" onClick={ onClose }>
					{ translate( 'Skip' ) }
				</Button>
				<div className="home-wizard__footer-right">
					<Button variant="primary" onClick={ handleSubmit } disabled={ ! canSubmit }>
						{ translate( 'Generate my checklist' ) }
					</Button>
				</div>
			</footer>
		</Modal>
	);
}
