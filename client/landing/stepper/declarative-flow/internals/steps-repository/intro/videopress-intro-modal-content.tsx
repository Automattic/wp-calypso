import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import './videopress-intro-modal-styles.scss';
import CheckmarkIcon from './icons/checkmark-icon';
import { IntroModalContentProps } from './intro';

const VideoPressIntroModalContent: React.FC< IntroModalContentProps > = ( { onSubmit } ) => {
	const translate = useTranslate();

	return (
		<div className="videopress-intro-modal">
			<h1 className="intro__title">{ translate( 'Your video site, with no hassle.' ) }</h1>
			<div className="intro__description">
				{ translate(
					'Create a WordPress.com site with everything you need to share your videos with the world.'
				) }
			</div>
			<ul className="videopress-intro-modal__list">
				<li>
					<CheckmarkIcon />
					<span>
						{ translate( '{{a}}Videomaker{{/a}}, a premium theme optimized to display videos.', {
							components: {
								a: (
									<a
										href="https://videomakerdemo.wordpress.com/"
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
					<span>
						{ translate( 'Upload videos directly to your site using the WordPress editor.' ) }
					</span>
				</li>
				<li>
					<CheckmarkIcon />
					<span>{ translate( 'Up to 200GB of storage and your own domain for a year.' ) }</span>
				</li>
			</ul>
			<div className="videopress-intro-modal__button-column">
				<Button className="intro__button" primary onClick={ onSubmit }>
					{ translate( 'Start free trial' ) }
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

export default VideoPressIntroModalContent;
