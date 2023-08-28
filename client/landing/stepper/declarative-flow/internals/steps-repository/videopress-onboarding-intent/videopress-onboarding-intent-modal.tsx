import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import '../intro/videopress-intro-modal-styles.scss';
import CheckmarkIcon from '../intro/icons/checkmark-icon';
import { IntroModalContentProps } from '../intro/intro';

export interface VideoPressOnboardingIntentModalContentProps extends IntroModalContentProps {
	title: string;
	description: string;
	featuresList?: string[] | React.ReactNode[];
	actionButton: {
		type: 'link' | 'button';
		text: string | JSX.Element;
		href?: string;
		onClick?: () => void;
	};
}

const VideoPressOnboardingIntentModal: React.FC< VideoPressOnboardingIntentModalContentProps > = ( {
	title,
	description,
	featuresList,
	actionButton,
} ) => {
	const translate = useTranslate();

	return (
		<div className="videopress-intro-modal">
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
			</div>
			<div className="videopress-intro-modal__screenshots">
				<img
					src="https://videopress2.files.wordpress.com/2023/02/videopress-modal-screenshots-2x.png"
					alt={ translate( 'Mobile device screenshot samples of the Videomaker theme.' ) }
				/>
			</div>
		</div>
	);
};

export default VideoPressOnboardingIntentModal;
