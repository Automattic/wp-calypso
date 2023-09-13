import { useTranslate } from 'i18n-calypso';
import { IntroModalContentProps } from '../intro/intro';
import VideoPressOnboardingIntentModal from './videopress-onboarding-intent-modal';

const VideoPressOnboardingIntentModalJetpack: React.FC< IntroModalContentProps > = () => {
	const translate = useTranslate();

	return (
		<VideoPressOnboardingIntentModal
			title={ translate( 'Add videos to your existing site.' ) }
			description={ translate(
				'Already have a self-hosted WordPress site? Enable the finest video with Jetpack VideoPress.'
			) }
			intent="jetpack"
			featuresList={ [
				translate( 'High-quality, lightning-fast video hosting.' ),
				translate( 'Drag and drop videos directly into WordPress.' ),
				translate( 'Unbranded, ad-free, customizable {{a}}VideoPress{{/a}} player.', {
					components: {
						a: (
							<a href="https://videopress.com" target="_blank" rel="external noreferrer noopener" />
						),
					},
				} ),
				translate( '1TB of storage and unlimited users.' ),
			] }
			actionButton={ {
				type: 'link',
				text: translate( 'Discover Jetpack VideoPress' ),
				href: 'https://jetpack.com/videopress/',
			} }
		/>
	);
};

export default VideoPressOnboardingIntentModalJetpack;
