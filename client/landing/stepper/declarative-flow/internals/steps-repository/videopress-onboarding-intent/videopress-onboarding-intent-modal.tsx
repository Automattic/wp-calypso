import { Button } from '@automattic/components';
import { Icon, arrowRight } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect } from 'react';
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
}

const VideoPressOnboardingIntentModal: React.FC< VideoPressOnboardingIntentModalContentProps > = ( {
	title,
	description,
	featuresList,
	actionButton,
	isComingSoon,
	surveyTitle,
	onSubmit,
} ) => {
	const translate = useTranslate();

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
							<FormTextInput placeholder={ translate( 'Enter your email' ) } />
							<Button className="intro__button" primary>
								{ translate( 'Join the waitlist' ) }
							</Button>
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
