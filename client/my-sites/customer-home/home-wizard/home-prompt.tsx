import { Modal, Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import PromptStep from './prompt-step';

import './style.scss';

type Props = {
	onClose: () => void;
	onComplete: ( answers: { intent: string } ) => void;
};

/**
 * Free-text variant of the wizard. Single-step modal — the user describes
 * their site idea in their own words and Dolly handles the rest:
 * inferring goal/niche/vibe, picking tasks, drafting a first post.
 *
 * Sibling to <HomeWizard> (the goals × features form). Both can be
 * launched from the dev FAB so the prototype can demo either entry point.
 */
export default function HomePrompt( { onClose, onComplete }: Props ) {
	const translate = useTranslate();
	const [ prompt, setPrompt ] = useState< string >( '' );

	const trimmed = prompt.trim();
	const canSubmit = trimmed.length > 0;

	const handleFinish = () => {
		if ( ! canSubmit ) {
			return;
		}
		onComplete( { intent: trimmed } );
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
			<PromptStep value={ prompt } onChange={ setPrompt } />

			<footer className="home-wizard__footer">
				<Button variant="tertiary" onClick={ onClose }>
					{ translate( 'Skip' ) }
				</Button>
				<div className="home-wizard__footer-right">
					<Button variant="primary" onClick={ handleFinish } disabled={ ! canSubmit }>
						{ translate( 'Finish' ) }
					</Button>
				</div>
			</footer>
		</Modal>
	);
}
