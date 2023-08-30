import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useState } from 'react';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { IntroModalContentProps } from '../intro/intro';
import IconSeparator from './icon-separator';
import VideoPressOnboardingIntentModal from './videopress-onboarding-intent-modal';

const VideoPressOnboardingIntentModalOther: React.FC< IntroModalContentProps > = () => {
	const translate = useTranslate();
	const [ userText, setUserText ] = useState( '' );

	const handleUserTextChange = ( event: ChangeEvent< HTMLInputElement > ) => {
		const userText = event?.target?.value;

		setUserText( userText );
	};

	const onUserTextSubmit = () => {
		// eslint-disable-next-line no-console
		console.log( 'submit', userText );
	};

	return (
		<VideoPressOnboardingIntentModal
			title={ translate( 'Have something different in mind?' ) }
			description={ translate(
				'We’d love to hear about your needs and goals around video content to continue improving VideoPress.'
			) }
		>
			<div className="videopress-intro-modal__dots-separator">
				<IconSeparator />
			</div>

			<div className="videopress-intro-modal-other__question-wrapper">
				<div>
					<p className="title">{ translate( 'Tell us more about your video project' ) }</p>
					<p className="subtitle">
						{ translate(
							'What are you trying to achieve? Are there specific features you’re looking for?'
						) }
					</p>
				</div>
				<FormTextarea
					className="answer-text"
					placeholder={ translate( 'Please feel free to share feedback, ideas, questions, etc' ) }
					value={ userText }
					onChange={ handleUserTextChange }
				/>
				<Button primary onClick={ onUserTextSubmit }>
					{ translate( 'Submit' ) }
				</Button>
			</div>
		</VideoPressOnboardingIntentModal>
	);
};

export default VideoPressOnboardingIntentModalOther;
