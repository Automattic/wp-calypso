import { Button } from '@automattic/components';
import { Icon, arrowRight } from '@wordpress/icons';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import React, { ChangeEvent, useEffect, useState } from 'react';
import '../intro/videopress-intro-modal-styles.scss';
import FormTextInput from 'calypso/components/forms/form-text-input';
import CheckmarkIcon from '../intro/icons/checkmark-icon';
import { IntroModalContentProps } from '../intro/intro';

export interface VideoPressOnboardingIntentModalContentProps extends IntroModalContentProps {
	title: string;
	description: string;
	featuresList?: string[] | React.ReactNode[];
	actionButton?: {
		type: 'link' | 'button';
		text: string | JSX.Element;
		href?: string;
		onClick?: () => void;
	};
	isComingSoon?: boolean;
	surveyTitle?: string;
	source?: string;
}

const VideoPressOnboardingIntentModal: React.FC< VideoPressOnboardingIntentModalContentProps > = ( {
	title,
	description,
	featuresList,
	actionButton,
	isComingSoon,
	surveyTitle,
	onSubmit,
	source,
} ) => {
	const translate = useTranslate();
	const [ waitlistEmail, setWaitlistEmail ] = useState( '' );
	const [ waitlistSubmitted, setWaitlistSubmitted ] = useState( false );
	const [ isWaitlistEmailValid, setIsWaitlistEmailValid ] = useState( false );

	const handleWaitlistEmailChange = ( event: ChangeEvent< HTMLInputElement > ) => {
		const newEmail = event?.target?.value;

		setWaitlistEmail( newEmail );
	};

	const handleWaitlistEmailBlur = () => {
		setIsWaitlistEmailValid( emailValidator.validate( waitlistEmail ) );
	};

	const onWaitlistSubmit = () => {
		if ( ! isWaitlistEmailValid ) {
			return;
		}

		const projectId = '34A774AE45CB5DBB';

		const formData = new window.FormData();
		formData.append( 'p', '0' );
		formData.append( 'r', '' );
		formData.append( 'startTime', `${ Math.floor( new Date().getTime() / 1000 ) }` );
		formData.append( 'q_8ca7e38c-cae2-4fd2-9f82-39aef59d792a[text]', waitlistEmail );
		if ( source ) {
			formData.append( 'q_e06e42f5-d190-4365-906e-3fc442287a35[text]', source );
		}

		fetch( `https://api.crowdsignal.com/v4/projects/${ projectId }/form`, {
			method: 'POST',
			body: formData,
		} )
			.then( ( response ) => {
				if ( response.ok ) {
					setWaitlistSubmitted( true );
				}
			} )
			// eslint-disable-next-line no-console
			.catch( ( err ) => console.error( err ) );
	};

	useEffect( () => {
		// set focus somewhere in the modal to assist with keyboard-based navigation
		document.getElementById( 'close-modal' )?.focus();
	}, [] );

	return (
		<div className="videopress-intro-modal">
			{ isComingSoon && (
				<div className="videopress-intro-modal__coming-soon">{ translate( 'Coming soon!' ) }</div>
			) }
			<h1 className="intro__title">{ title }</h1>
			<div className="intro__description">{ description }</div>
			{ featuresList && (
				<ul className="videopress-intro-modal__list">
					{ featuresList?.map( ( feature, index ) => (
						<li key={ index }>
							<CheckmarkIcon />
							<span>{ feature }</span>
						</li>
					) ) }
				</ul>
			) }
			<div className="videopress-intro-modal__button-column">
				{ actionButton && (
					<>
						<Button
							type={ actionButton.type }
							href={ actionButton.href ?? '' }
							className="intro__button"
							primary
							onClick={ actionButton.onClick }
						>
							{ actionButton.text }
						</Button>
						<div className="learn-more">
							{ translate( '{{a}}Or learn more about VideoPress.{{/a}}', {
								components: {
									a: (
										<a
											href="https://videopress.com/"
											target="_blank"
											rel="external noreferrer noopener"
										/>
									),
								},
							} ) }
						</div>
					</>
				) }
				{ isComingSoon && (
					<div className="videopress-intro-modal__waitlist-presentation">
						<div className="videopress-intro-modal__waitlist">
							{ ! waitlistSubmitted && (
								<>
									<FormTextInput
										placeholder={ translate( 'Enter your email' ) }
										value={ waitlistEmail }
										onChange={ handleWaitlistEmailChange }
										onBlur={ handleWaitlistEmailBlur }
										isError={ ! isWaitlistEmailValid }
									/>
									<Button
										className="intro__button"
										primary
										onClick={ onWaitlistSubmit }
										disabled={ ! isWaitlistEmailValid }
									>
										{ translate( 'Join the waitlist' ) }
									</Button>
								</>
							) }
							{ waitlistSubmitted && (
								<p className="videopress-intro-modal__waitlist-response">
									{ translate( "Thanks for joining the waitlist! We'll keep you updated." ) }
								</p>
							) }
						</div>
						<div className="videopress-intro-modal__waitlist-description">
							{ translate(
								'In the meantime, you can {{a}}create a video portfolio{{/a}}, {{b}}a blog with video{{/b}}, or {{c}}add videos to your existing site{{/c}}.',
								{
									components: {
										a: <Button onClick={ () => onSubmit?.() && false } />,
										b: (
											<a
												href="https://wordpress.com/start/premium/?ref=videopress"
												rel="external noreferrer noopener"
											/>
										),
										c: (
											<a
												href="https://jetpack.com/videopress/"
												rel="external noreferrer noopener"
											/>
										),
									},
								}
							) }
						</div>
					</div>
				) }
			</div>
			<div className="videopress-intro-modal__screenshots">
				<img
					src="https://videopress2.files.wordpress.com/2023/02/videopress-modal-screenshots-2x.png"
					alt={ translate( 'Mobile device screenshot samples of the Videomaker theme.' ) }
				/>
			</div>
			{ surveyTitle && (
				<div className="videopress-intro-modal__survey">
					<div className="videopress-intro-modal__survey-info">
						<div className="videopress-intro-modal__survey-title">{ surveyTitle }</div>
						<div className="videopress-intro-modal__survey-description">
							{ translate(
								'Send your feedback and help us shape the future of VideoPress by answering this short survey.'
							) }
						</div>
					</div>
					<Button
						className="intro__button button-survey"
						href="https://automattic.survey.fm/videopress-onboarding-user-intent-survey"
						target="_blank"
						plain
					>
						{ translate( 'Answer the survey' ) }
						<Icon icon={ arrowRight } />
					</Button>
				</div>
			) }
		</div>
	);
};

export default VideoPressOnboardingIntentModal;
