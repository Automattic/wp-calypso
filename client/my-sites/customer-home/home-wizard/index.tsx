import { Modal, Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import ChipsStep from './chips-step';
import PromptStep from './prompt-step';
import type { WizardAnswers, WizardVariant } from './types';

import './style.scss';

type Props = {
	variant: WizardVariant;
	onClose: () => void;
	onComplete: ( answers: WizardAnswers ) => void;
};

const MIN_PROMPT_CHARS = 8;

export default function HomeWizard( { variant, onClose, onComplete }: Props ) {
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
			className={ `home-wizard home-wizard--${ variant }` }
			shouldCloseOnClickOutside={ false }
			__experimentalHideHeader
			size="medium"
		>
			{ variant === 'textarea' && <PromptStep value={ prompt } onChange={ setPrompt } /> }
			{ variant === 'chips' && <ChipsStep value={ prompt } onChange={ setPrompt } /> }

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
