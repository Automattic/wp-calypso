import { useTranslate } from 'i18n-calypso';
import { IntroModalContentProps } from '../intro/intro';
import VideoPressOnboardingIntentModal from './videopress-onboarding-intent-modal';

const VideoPressOnboardingIntentModalChannel: React.FC< IntroModalContentProps > = ( {
	onSubmit,
} ) => {
	const translate = useTranslate();

	return (
		<VideoPressOnboardingIntentModal
			title={ translate( 'A home for all your videos.' ) }
			description={ translate(
				'VideoPress TV is the easiest way to upload videos and create a community around them.'
			) }
			intent="channel"
			featuresList={ [
				translate( 'Ready to go! No setup needed.' ),
				translate( 'The easiest way to upload your videos.' ),
				translate( 'Earn money through subscriptions.' ),
				translate( 'Foster and engage with your community.' ),
			] }
			onSubmit={ onSubmit }
			isComingSoon={ true }
			surveyTitle={ translate( 'Which additional features are you looking for?' ) }
			surveyUrl="https://automattic.crowdsignal.net/video-channel-survey"
			source="channel"
		/>
	);
};

export default VideoPressOnboardingIntentModalChannel;
