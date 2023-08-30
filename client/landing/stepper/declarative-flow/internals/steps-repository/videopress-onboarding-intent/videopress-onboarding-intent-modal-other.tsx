import { useTranslate } from 'i18n-calypso';
import { IntroModalContentProps } from '../intro/intro';
import VideoPressOnboardingIntentModal from './videopress-onboarding-intent-modal';

const VideoPressOnboardingIntentModalOther: React.FC< IntroModalContentProps > = () => {
	const translate = useTranslate();

	return (
		<VideoPressOnboardingIntentModal
			title={ translate( 'Have something different in mind?' ) }
			description={ translate(
				'We’d love to hear about your needs and goals around video content to continue improvind VideoPress.'
			) }
		>
			<h3>Yo i'm a child</h3>
		</VideoPressOnboardingIntentModal>
	);
};

export default VideoPressOnboardingIntentModalOther;
