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
	learnMoreText?: string | React.ReactNode;
	isComingSoon?: boolean;
	intent?: string;
	surveyTitle?: string;
	surveyUrl?: string;
	source?: string;
}
const showScreenshot = ( intent?: string ) => [ 'video-upload' ].indexOf( intent || '' ) < 0;

const VideoPressOnboardingIntentModal: React.FC< VideoPressOnboardingIntentModalContentProps > = ( {
	title,
	description,
	intent,
	featuresList,
	actionButton,
	learnMoreText,
	isComingSoon,
	surveyTitle,
	surveyUrl,
	onSubmit,
	source,
	children,
} ) => {
	const translate = useTranslate();
	const [ waitlistEmail, setWaitlistEmail ] = useState( '' );
	const [ waitlistSubmitted, setWaitlistSubmitted ] = useState( false );
	const [ isWaitlistEmailValid, setIsWaitlistEmailValid ] = useState( false );
	const [ isWaitlistFormEnabled, setIsWaitlistFormEnabled ] = useState( true );

	const handleWaitlistEmailChange = ( event: ChangeEvent< HTMLInputElement > ) => {
		const newEmail = event?.target?.value;

		setIsWaitlistEmailValid( emailValidator.validate( newEmail ) );
		setWaitlistEmail( newEmail );
	};

	const handleWaitlistEmailBlur = () => {
		setIsWaitlistEmailValid( emailValidator.validate( waitlistEmail ) );
	};

	const onWaitlistSubmit = () => {
		if ( ! isWaitlistEmailValid || ! isWaitlistFormEnabled ) {
			return;
		}
		setIsWaitlistFormEnabled( false );

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

					if ( window.sessionStorage ) {
						sessionStorage.setItem( `videopress-user-intent-waitlist-${ source }`, '1' );
					}
				}
				setIsWaitlistFormEnabled( true );
			} )
			.catch( ( err ) => {
				// eslint-disable-next-line no-console
				console.error( err );
				setIsWaitlistFormEnabled( true );
			} );
	};

	const onWaitlistInputKeyUp = ( event: React.KeyboardEvent< HTMLInputElement > ) => {
		if ( 'Enter' === event.key ) {
			onWaitlistSubmit();
		}
	};

	useEffect( () => {
		// set focus somewhere in the modal to assist with keyboard-based navigation
		document.getElementById( 'close-modal' )?.focus();
	}, [] );

	useEffect( () => {
		const waitlistSent = window.sessionStorage
			? !! sessionStorage.getItem( `videopress-user-intent-waitlist-${ source }` ) || false
			: false;

		setWaitlistSubmitted( waitlistSent );
	}, [ source ] );

	return (
		<div className="videopress-intro-modal">
			{ isComingSoon && (
				<div className="videopress-intro-modal__coming-soon">{ translate( 'Coming soon!' ) }</div>
			) }
			<h1 className="intro__title">{ title }</h1>
			<div className="intro__scrollpane">
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
							<div className="learn-more">{ learnMoreText }</div>
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
											onKeyUp={ onWaitlistInputKeyUp }
											onBlur={ handleWaitlistEmailBlur }
											isError={ ! isWaitlistEmailValid && '' !== waitlistEmail }
											disabled={ ! isWaitlistFormEnabled }
										/>
										<Button
											className="intro__button"
											primary
											onClick={ onWaitlistSubmit }
											disabled={ ! isWaitlistEmailValid || ! isWaitlistFormEnabled }
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
				{ children }
				{ showScreenshot( intent ) && (
					<div className="videopress-intro-modal__screenshots">
						<img
							src="https://videopress2.files.wordpress.com/2023/02/videopress-modal-screenshots-2x.png"
							alt={ translate( 'Mobile device screenshot samples of the Videomaker theme.' ) }
						/>
					</div>
				) }
			</div>
			{ surveyTitle && surveyUrl && (
				<div className="videopress-intro-modal__survey">
					<div className="videopress-intro-modal__survey-info">
						<div className="videopress-intro-modal__survey-title">{ surveyTitle }</div>
						<div className="videopress-intro-modal__survey-description">
							{ translate(
								'Send your feedback and help us shape the future of VideoPress by answering this short survey.'
							) }
						</div>
					</div>
					<Button className="intro__button button-survey" href={ surveyUrl } target="_blank" plain>
						{ translate( 'Answer the survey' ) }
						<Icon icon={ arrowRight } />
					</Button>
				</div>
			) }
		</div>
	);
};

export default VideoPressOnboardingIntentModal;
