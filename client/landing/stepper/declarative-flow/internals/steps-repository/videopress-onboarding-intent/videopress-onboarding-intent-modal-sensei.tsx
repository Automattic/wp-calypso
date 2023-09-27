import { useTranslate } from 'i18n-calypso';
import { IntroModalContentProps } from '../intro/intro';
import VideoPressOnboardingIntentModal from './videopress-onboarding-intent-modal';

const VideoPressOnboardingIntentModalSensei: React.FC< IntroModalContentProps > = () => {
	const translate = useTranslate();

	return (
		<VideoPressOnboardingIntentModal
			title={ translate( 'Add videos to your online courses.' ) }
			description={ translate(
				'Start your journey with VideoPress and Sensei LMS to create stunning video lessons.'
			) }
			intent="video-upload"
			featuresList={ [
				translate( 'High-quality, lightning-fast video hosting.' ),
				translate( 'Create and sell online courses.' ),
				translate( 'Interactive video blocks.' ),
				translate( 'Effortlessly create immersive and interactive online courses.' ),
			] }
			actionButton={ {
				type: 'link',
				text: translate( 'Discover Sensei LMS' ),
				href: 'https://senseilms.com/sensei-pro/?ref=videopress',
			} }
		/>
	);
};

export default VideoPressOnboardingIntentModalSensei;
