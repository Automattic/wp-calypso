import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import '../intro/videopress-intro-modal-styles.scss';
import CheckmarkIcon from '../intro/icons/checkmark-icon';
import { IntroModalContentProps } from '../intro/intro';

const VideoPressOnboardingIntentModalBlog: React.FC< IntroModalContentProps > = ( {
	onSubmit,
} ) => {
	const translate = useTranslate();

	return (
		<div className="videopress-intro-modal">
			<h1 className="intro__title">
				{ translate( 'The best blogging system with the best video.' ) }
			</h1>
			<div className="intro__description">
				{ translate(
					'Create a new blog on WordPress.com with unmatched video capabilities out of the box.'
				) }
			</div>
			<ul className="videopress-intro-modal__list">
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
				<li>
					<CheckmarkIcon />
					<span>{ translate( 'The best premium themes at your disposal.' ) }</span>
				</li>
			</ul>
			<div className="videopress-intro-modal__button-column">
				<Button className="intro__button" primary onClick={ onSubmit }>
					{ translate( 'Get started with premium' ) }
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

export default VideoPressOnboardingIntentModalBlog;
