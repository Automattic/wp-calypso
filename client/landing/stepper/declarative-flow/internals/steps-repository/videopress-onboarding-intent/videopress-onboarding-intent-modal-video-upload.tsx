import { useTranslate } from 'i18n-calypso';
import { IntroModalContentProps } from '../intro/intro';
import VideoPressOnboardingIntentModal from './videopress-onboarding-intent-modal';

const VideoPressOnboardingIntentModalVideoUpload: React.FC< IntroModalContentProps > = ( {
	onSubmit,
} ) => {
	const translate = useTranslate();

	return (
		<VideoPressOnboardingIntentModal
			title={ translate( 'The fastest way to share a video.' ) }
			description={ translate( 'All the power of VideoPress, simplified.' ) }
			featuresList={ [
				translate( 'Upload a video file and obtain a share link. That’s it.' ),
				translate( 'Embed your video anywhere.' ),
				translate( 'Unbranded, ad-free, customizable {{a}}VideoPress{{/a}} player.', {
					components: {
						a: (
							<a href="https://videopress.com" target="_blank" rel="external noreferrer noopener" />
						),
					},
				} ),
			] }
			onSubmit={ onSubmit }
			isComingSoon={ true }
			surveyTitle={ translate( 'Are you interested in specific features?' ) }
			surveyUrl="https://automattic.crowdsignal.net/video-upload-survey"
			source="video"
		/>
	);
};

export default VideoPressOnboardingIntentModalVideoUpload;
