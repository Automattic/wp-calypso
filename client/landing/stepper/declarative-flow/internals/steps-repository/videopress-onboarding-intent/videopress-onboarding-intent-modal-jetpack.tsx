import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import '../intro/videopress-intro-modal-styles.scss';
import CheckmarkIcon from '../intro/icons/checkmark-icon';
import { IntroModalContentProps } from '../intro/intro';

const VideoPressOnboardingIntentModalJetpack: React.FC< IntroModalContentProps > = () => {
	const translate = useTranslate();

	return (
		<div className="videopress-intro-modal">
			<h1 className="intro__title">{ translate( 'Add videos to your existing site.' ) }</h1>
			<div className="intro__description">
				{ translate(
					'Already have a self-hosted WordPress site? Enable the finest video with Jetpack VideoPress.'
				) }
			</div>
			<ul className="videopress-intro-modal__list">
				<li>
					<CheckmarkIcon />
					<span>{ translate( 'High-quality, lightning-fast video hosting.' ) }</span>
				</li>
				<li>
					<CheckmarkIcon />
					<span>{ translate( 'Drag and drop videos directly into WordPress.' ) }</span>
				</li>
				<li>
					<CheckmarkIcon />
					<span>
						{ translate( 'Unbranded, ad-free, customizable {{a}}VideoPress{{/a}} player.', {
							components: {
								a: (
									<a
										href="https://videopress.com"
										target="_blank"
										rel="external noreferrer noopener"
									/>
								),
							},
						} ) }
					</span>
				</li>
				<li>
					<CheckmarkIcon />
					<span>{ translate( '1TB of storage and unlimited users.' ) }</span>
				</li>
			</ul>
			<div className="videopress-intro-modal__button-column">
				<Button
					type="link"
					href="https://jetpack.com/videopress/"
					className="intro__button"
					primary
				>
					{ translate( 'Discover Jetpack VideoPress' ) }
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

export default VideoPressOnboardingIntentModalJetpack;
