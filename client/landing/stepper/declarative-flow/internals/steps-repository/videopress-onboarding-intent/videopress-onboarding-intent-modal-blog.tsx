import { useTranslate } from 'i18n-calypso';
import { IntroModalContentProps } from '../intro/intro';
import VideoPressOnboardingIntentModal from './videopress-onboarding-intent-modal';

const VideoPressOnboardingIntentModalBlog: React.FC< IntroModalContentProps > = () => {
	const translate = useTranslate();

	return (
		<VideoPressOnboardingIntentModal
			title={ translate( 'The best blogging system with the best video.' ) }
			description={ translate(
				'Create a new blog on WordPress.com with unmatched video capabilities out of the box.'
			) }
			intent="blog"
			featuresList={ [
				translate( 'Unbranded, ad-free, customizable {{a}}VideoPress{{/a}} player.', {
					components: {
						a: (
							<a href="https://videopress.com" target="_blank" rel="external noreferrer noopener" />
						),
					},
				} ),
				translate( 'Upload videos directly to your site using the WordPress editor.' ),
				translate( 'Up to 200GB of storage and your own domain for a year.' ),
				translate( 'The best premium themes at your disposal.' ),
			] }
			actionButton={ {
				type: 'link',
				text: translate( 'Get started with premium' ),
				href: '/start/premium/?ref=videopress',
			} }
		/>
	);
};

export default VideoPressOnboardingIntentModalBlog;
