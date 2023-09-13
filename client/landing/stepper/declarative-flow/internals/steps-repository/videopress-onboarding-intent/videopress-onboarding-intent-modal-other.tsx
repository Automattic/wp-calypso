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
	const [ isUserTextSubmitted, setIsUserTextSubmitted ] = useState( false );

	const handleUserTextChange = ( event: ChangeEvent< HTMLInputElement > ) => {
		const userText = event?.target?.value;

		setUserText( userText );
	};

	const onUserTextSubmit = () => {
		const projectId = 'B1C607EFF3E18160';

		const formData = new window.FormData();
		formData.append( 'p', '0' );
		formData.append( 'r', '' );
		formData.append( 'startTime', `${ Math.floor( new Date().getTime() / 1000 ) }` );
		formData.append( 'q_0c917498-2d77-49f8-b1d2-4bf17aa8d0f5[text]', userText );

		fetch( `https://api.crowdsignal.com/v4/projects/${ projectId }/form`, {
			method: 'POST',
			body: formData,
		} )
			.then( ( response ) => {
				if ( response.ok ) {
					setIsUserTextSubmitted( true );
				}
			} )
			// eslint-disable-next-line no-console
			.catch( ( err ) => console.error( err ) );
	};

	return (
		<VideoPressOnboardingIntentModal
			title={ translate( 'Have something different in mind?' ) }
			description={ translate(
				'We’d love to hear about your needs and goals around video content to continue improving VideoPress.'
			) }
			intent="other"
		>
			<div className="videopress-intro-modal__dots-separator">
				<IconSeparator />
			</div>

			<div className="videopress-intro-modal-other__question-wrapper">
				{ ! isUserTextSubmitted && (
					<>
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
							placeholder={ translate(
								'Please feel free to share feedback, ideas, questions, etc'
							) }
							value={ userText }
							onChange={ handleUserTextChange }
						/>
						<Button primary onClick={ onUserTextSubmit }>
							{ translate( 'Submit' ) }
						</Button>
					</>
				) }
				{ isUserTextSubmitted && (
					<p className="response-text">{ translate( 'Thank you for your feedback.' ) }</p>
				) }
			</div>
		</VideoPressOnboardingIntentModal>
	);
};

export default VideoPressOnboardingIntentModalOther;
