import { StepContainer } from '@automattic/onboarding';
import FormattedHeader from 'calypso/components/formatted-header';
import type { Step } from '../../types';

const WooVerifyEmail: Step = function WooVerifyEmail( { navigation } ) {
	const { goBack } = navigation;

	function recordTracksEvent() {
		return true;
	}

	function getContent() {
		return <div>Content</div>;
	}

	return (
		<StepContainer
			stepName={ 'woo-verify-email' }
			goBack={ goBack }
			hideSkip
			isHorizontalLayout={ true }
			formattedHeader={
				<FormattedHeader
					id={ 'woo-verify-email' }
					headerText={ "You're all set Vini!" }
					subHeaderText={ '' }
					align={ 'left' }
				/>
			}
			stepContent={ getContent() }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default WooVerifyEmail;
