import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
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
								'In the meantime, you can {{a}}create a blog with video{{/a}}, a {{b}}video portfolio{{/b}}, or {{c}}add videos to your existing site{{/c}}.',
								{
									components: {
										a: <Button onClick={ () => onSubmit?.() && false } />,
										b: <Button onClick={ () => onSubmit?.() && false } />,
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
							{ translate( 'Answer a short survey and you’ll have the chance to win $50.' ) }
						</div>
					</div>
					<Button className="intro__button button-survey" primary>
						{ translate( 'Answer the survey ->' ) }
					</Button>
				</div>
			) }
		</div>
	);
};

export default VideoPressOnboardingIntentModal;
